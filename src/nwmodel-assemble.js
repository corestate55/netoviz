"use strict";

function makeGraphNodesFromTopoNodes(nwNum, nwName, topoNodes) {
    var nodeNum = 1;
    var graphNodes = [];
    topoNodes.forEach(function(node) {
        // child node for "node"
        var nodeChildPaths = [];
        if (node["supporting-node"]) {
            nodeChildPaths = node["supporting-node"].map(function(snode) {
                return graphObjPath(snode["network-ref"], snode["node-ref"]);
            });
        }
        // "node" node (for drawing)
        graphNodes.push({
            "type": "node",
            "name": node["node-id"],
            "id": graphObjId(nwNum, nodeNum, 0),
            "path": graphObjPath(nwName, node["node-id"]),
            "children": nodeChildPaths.join(","), // lower layer
            "parents": "" // upper layer
        });
        // node as termination point
        var tpKey = "ietf-network-topology:termination-point"; // alias
        if (node[tpKey]) {
            var tpNum = 1;
            node[tpKey].forEach(function(tp) {
                // child node for "tp"
                var tpChildPaths = [];
                var stpKey = "supporting-termination-point"; // alias
                if (tp[stpKey]) {
                    tpChildPaths = tp[stpKey].map(function(stp) {
                        return graphObjPath(
                            stp["network-ref"], stp["node-ref"], stp["tp-ref"]
                        );
                    });
                }
                // "tp" node (for drawing)
                graphNodes.push({
                    "type": "tp",
                    "name": tp["tp-id"],
                    "id": graphObjId(nwNum, nodeNum, tpNum),
                    "path": graphObjPath(nwName, node["node-id"], tp["tp-id"]),
                    "children": tpChildPaths.join(","),
                    "parents": ""
                });
                tpNum++;
            });
        }
        nodeNum++;
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
                "source_id": nodeId,
                "target_id": tp.id,
                "name": tpName,
                "path": graphObjPath(nwName, nodeName, tpName)
            });
        });
    return graphLinks;
}

function makeParentRef(graphs) {
    var allGraphNodes = makeAllGraphNodes(graphs);
    for (var nwName in graphs) {
        graphs[nwName].nodes.forEach(function(node) {
            if (node.children) {
                node.children.split(",").forEach(function(cPath) {
                    var child = findGraphObjByPath(cPath, allGraphNodes);
                    if (child.parents) {
                        child.parents = [child.parents, node.path].join(",");
                    } else {
                        child.parents = node.path;
                    }
                });
            }
        });
    }
    return graphs;
}

function makeNodeData(topoData) {
    var graphs = {};
    var nwNum = 1;
    topoData["ietf-network:networks"].network.forEach(function(nw) {
        var graphNodes = makeGraphNodesFromTopoNodes(
            nwNum, nw["network-id"], nw.node
        );
        var graphLinks = makeGraphLinksFromTopoLinks(
            nw["network-id"], nw["ietf-network-topology:link"], graphNodes
        );
        graphs[nw["network-id"]] = {
            "nodes": graphNodes,
            "links": graphLinks
        };
        nwNum++;
    });
    console.log(makeParentRef(graphs));
    return graphs;
}
