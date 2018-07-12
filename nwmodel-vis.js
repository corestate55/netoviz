"use strict";

d3.json("http://localhost:8000/target.json", runNetworkModelVis);

function graphObjId(nwNum, nodeNum, tpNum) {
    return nwNum * 10000 + nodeNum * 100 + tpNum;
}

function nodeObjIdFromTpObjId(destId) {
    return (Math.floor(destId / 100)) * 100;
}

function graphObjPath(nwName, nodeName, tpName) {
    if (tpName) {
        return [nwName, nodeName, tpName].join("/");
    }
    return [nwName, nodeName].join("/");
}

function makeGraphNodesFromTopoNodes(nwNum, nwName, topoNodes) {
    var nodeNum = 1;
    var graphNodes = [];
    topoNodes.forEach(function(node) {
        // child node for "node"
        var nodeChildPaths = [];
        if (node["supporting-node"]) {
            node["supporting-node"].forEach(function(snode) {
                nodeChildPaths.push(
                    graphObjPath(snode["network-ref"], snode["node-ref"])
                );
            });
        }
        // node
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
                if (tp["supporting-termination-point"]) {
                    tp["supporting-termination-point"].forEach(function(stp) {
                        tpChildPaths.push(
                            graphObjPath(stp["network-ref"],
                                         stp["node-ref"],
                                         stp["tp-ref"])
                        );
                    });
                }
                // tp
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

function findGraphObjByPath(path, graphNodes) {
    var obj = null;
    graphNodes.some(function(node) {
        if (node.path === path) {
            obj = node;
            return true;
        }
    });
    return obj;
}

function findGraphObjById(id, graphNodes) {
    var obj = null;
    graphNodes.some(function(node) {
        if (node.id === id) {
            obj = node;
            return true;
        }
    });
    return obj;
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

function runNetworkModelVis(error, topoData) {
    if (error) {
        throw error;
    }
    drawGraphs(makeNodeData(topoData));
}

function makeAllGraphNodes(graphs) {
    var allGraphNodes = [];
    for (var nwName in graphs) {
        // concatenate nodes in all layers
        allGraphNodes = allGraphNodes.concat(graphs[nwName].nodes);
    }
    return allGraphNodes;
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

function drawGraphs(graphs) {
    var width = 1000;
    var height = 1000;
    var allGraphNodes = makeAllGraphNodes(graphs);

    // find nodes to highlight via through all layers
    function highlightNode(d) {
        function findSupportingObj(direction, path) {
            console.log("highlight ", direction, path);
            var node = findGraphObjByPath(path, allGraphNodes);
            var list = [];
            if(node[direction]) {
                list = node[direction].split(",");
                list.forEach(function(d) {
                    findSupportingObj(direction, d);
                });
            }
        }
        var path = d.getAttribute("id");
        console.log("highlight_top: ", path);
        findSupportingObj("children", path);
        findSupportingObj("parents", path);
    }

    // draw each layer
    for (var nwName in graphs) {
        var simulation = d3.forceSimulation()
            .force("link", d3.forceLink().id(function(d) { return d.id; }))
            .force("charge", d3.forceManyBody().strength(-50))
            .force("center", d3.forceCenter(width / 2, height / 2));
        var nwLayer = d3.select("body")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g") // topology graph container
            .attr("id", nwName)
            .attr("class", "network");
        drawGraph(simulation, nwLayer, graphs[nwName], highlightNode);
    }
}

function drawGraph(simulation, nwLayer, graph, highlightNode) {
    graph.links.forEach(function(d) {
        d.source = d.source_id;
        d.target = d.target_id;
    });

    var link = nwLayer.append("g")
        .attr("class", "link")
        .selectAll("line")
        .data(graph.links)
        .enter()
        .append("line")
        .attr("id", function(d) { return d.path; });

    var tp = nwLayer.append("g")
        .attr("class", "tp")
        .selectAll("circle")
        .data(graph.nodes.filter(function(d) { return d.type === "tp"; }))
        .enter()
        .append("circle")
        .attr("id", function(d) { return d.path; })
        .on("mouseover", function() { highlightNode(this); })
        .call(d3.drag()
              .on("start", dragstarted)
              .on("drag", dragged)
              .on("end", dragended));

    var node = nwLayer.append("g")
        .attr("class", "node")
        .selectAll("rect")
        .data(graph.nodes.filter(function(d) { return d.type === "node"; }))
        .enter()
        .append("rect")
        .attr("id", function(d) { return d.path; })
        .on("mouseover", function() { highlightNode(this); })
        .call(d3.drag()
              .on("start", dragstarted)
              .on("drag", dragged)
              .on("end", dragended));

    var label = nwLayer.append("g")
        .attr("class", "labels")
        .selectAll("text")
        .data(graph.nodes)
        .enter()
        .append("text")
        .attr("class", "label")
        .text(function(d) { return d.name; });

    simulation
        .nodes(graph.nodes)
        .on("tick", ticked)
        .force("link")
        .links(graph.links);

    function dragstarted(d) {
        if (!d3.event.active) {
            simulation.alphaTarget(0.3).restart();
        }
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(d) {
        // console.log("dragged: ", d);
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    function dragended(d) {
        // console.log("dragended: ", d);
        if (!d3.event.active) {
            simulation.alphaTarget(0);
        }
        d.fx = null;
        d.fy = null;
    }

    function ticked() {
        link
            .attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        var tpSize = 10;
        tp
            .attr("r", tpSize)
            .attr("cx", function (d) { return d.x; })
            .attr("cy", function(d) { return d.y; });

        var nodeSize = 40;
        node
            .attr("width", nodeSize)
            .attr("height", nodeSize)
            .attr("x", function (d) { return d.x - nodeSize / 2; })
            .attr("y", function(d) { return d.y - nodeSize / 2; });

        label
            .attr("x", function(d) { return d.x; })
            .attr("y", function (d) { return d.y; });
    }
}
