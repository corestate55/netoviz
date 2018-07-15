"use strict";

function makeTpChildrenFromSupportingTp(tp) {
    var stpKey = "supporting-termination-point"; // alias
    if (!tp[stpKey]) {
        return [];
    }
    return tp[stpKey].map(function(stp) {
        return graphObjPath(
            stp["network-ref"], stp["node-ref"], stp["tp-ref"]
        );
    });
}

function makeGraphTpsFromTopoTps(nwNum, nwName, nodeNum, node) {
    var tpKey = "ietf-network-topology:termination-point"; // alias
    if (!node[tpKey]) {
        return [];
    }

    // node as termination point
    return node[tpKey].map(function(tp, tpNum) {
        // child node for "tp"
        // It always has THIS node (which owns THIS tp)
        var tpChildPaths = [graphObjPath(nwName, node["node-id"])].concat(
            makeTpChildrenFromSupportingTp(tp)
        );
        // "tp" node (for drawing)
        return {
            "type": "tp",
            "name": tp["tp-id"],
            "id": graphObjId(nwNum, nodeNum, tpNum + 1),
            "path": graphObjPath(nwName, node["node-id"], tp["tp-id"]),
            "children": tpChildPaths.join(","),
        };
    });
}

function makeNodeChildrenFromSupportingNode(node) {
    if (!node["supporting-node"]) {
        return [];
    }
    return node["supporting-node"].map(function(snode) {
        return graphObjPath(snode["network-ref"], snode["node-ref"]);
    });
}

function makeGraphNodesFromTopoNodes(nwNum, nwName, topoNodes) {
    var graphNodes = [];
    topoNodes.forEach(function(node, i) {
        var nodeNum = i + 1; // index starts from 1
        // child node for "node" (ref to underlay)
        var nodeChildPaths = makeNodeChildrenFromSupportingNode(node);
        // "node" node (for drawing)
        graphNodes.push({
            "type": "node",
            "name": node["node-id"],
            "id": graphObjId(nwNum, nodeNum, 0),
            "path": graphObjPath(nwName, node["node-id"]),
            "children": nodeChildPaths.join(","), // lower layer
        });
        // "tp" node (for drawing)
        var graphTps = makeGraphTpsFromTopoTps(nwNum, nwName, nodeNum, node);
        if (graphTps) {
            graphNodes = graphNodes.concat(graphTps);
        }
    });
    return graphNodes;
}

function makeGraphLinksFromTopoLinks(nwName, topoLinks, graphNodes) {
    var graphLinks = [];

    // tp-tp link
    topoLinks.forEach(function(link) {
        var src = link.source;
        var dst = link.destination;
        var sourceId = findGraphObjByPath(
            graphObjPath(nwName, src["source-node"], src["source-tp"]),
            graphNodes).id;
        var targetId = findGraphObjByPath(
            graphObjPath(nwName, dst["dest-node"], dst["dest-tp"]),
            graphNodes).id;

        graphLinks.push({
            "type": "tp-tp",
            "source_id": sourceId,
            "target_id": targetId,
            "name": link["link-id"],
            "path": graphObjPath(nwName, link["link-id"])
        });
    });
    // node-tp link
    graphNodes
        .filter(function(d) { return d.type === "tp"; })
        .forEach(function(tp) {
            var nodeId = nodeObjIdFromTpObjId(tp.id);
            var nodeName = findGraphObjById(nodeId, graphNodes).name;
            var tpName = [nodeName, tp.name].join(",");
            graphLinks.push({
                "type": "node-tp",
                "source_id": nodeId,
                "target_id": tp.id,
                "name": tpName,
                "path": graphObjPath(nwName, nodeName, tpName)
            });
        });
    return graphLinks;
}

function concatNodeParents(child, path) {
    if (child.parents) {
        return [child.parents, path].join(",");
    }
    return path;
}

function makeParentRef(graphs) {
    var allGraphNodes = makeAllGraphNodes(graphs);
    for (var nwName in graphs) {
        graphs[nwName].nodes.forEach(function(node) {
            if (node.children) {
                node.children.split(",").forEach(function(cPath) {
                    var child = findGraphObjByPath(cPath, allGraphNodes);
                    child.parents = concatNodeParents(child, node.path);
                });
            }
        });
    }
    return graphs;
}

function makeNodeData(topoData) {
    var graphs = {};
    topoData["ietf-network:networks"].network.forEach(function(nw, nwNum) {
        var graphNodes = makeGraphNodesFromTopoNodes(
            nwNum + 1, nw["network-id"], nw.node
        );
        var graphLinks = makeGraphLinksFromTopoLinks(
            nw["network-id"], nw["ietf-network-topology:link"], graphNodes
        );
        graphs[nw["network-id"]] = {
            "nodes": graphNodes,
            "links": graphLinks
        };
    });
    console.log(makeParentRef(graphs));
    return graphs;
}
