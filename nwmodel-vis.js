"use strict";

d3.json("http://localhost:8000/target.json", runNetworkModelVis);

function graphObjId(nwNum, nodeNum, tpNum) {
    return nwNum * 10000 + nodeNum * 100 + tpNum;
}

function graphObjPath(nwName, nodeName, tpName) {
    if(tpName) {
        return [nwName, nodeName, tpName].join('/');
    }
    return [nwName, nodeName].join('/');
}

function makeGraphNodesFromTopoNodes(nwNum, nwName, topoNodes) {
    var nodeNum = 1;
    var graphNodes = [];
    topoNodes.forEach(function(node) {
        // node
        graphNodes.push({
            "name": node['node-id'],
            "id": graphObjId(nwNum, nodeNum, 0),
            "path": graphObjPath(nwName, node['node-id'], null)
        });
        nodeNum++;
    });
    return graphNodes;
}

function makeGraphTpsFromTopoNodes(nwNum, nwName, topoNodes) {
    var nodeNum = 1;
    var graphTps = [];
    topoNodes.forEach(function(node) {
        // node as termination point
        var tpKey = 'ietf-network-topology:termination-point'; // alias
        if(node[tpKey]) {
            var tpNum = 1;
            node[tpKey].forEach(function(tp) {
                graphTps.push({
                    "name": tp['tp-id'],
                    "id": graphObjId(nwNum, nodeNum, tpNum),
                    "path": graphObjPath(nwName, node['node-id'], tp['tp-id'])
                });
                tpNum++;
            });
        }
        nodeNum++;
    });
    return graphTps;
}

function findGraphObjId(path, graphNodes) {
    var objId = 0;
    graphNodes.some(function(node) {
        if(node['path'] == path) {
            objId = node['id'];
            return true;
        }
    });
    return objId;
}

function makeGraphLinksFromTopoLinks(nwName, topoLinks, graphNodes, graphTps) {
    var graphLinks = [];
    var nodeAndTp = graphNodes.concat(graphTps);

    // tp-tp link
    topoLinks.forEach(function(link) {
        var src = link['source'];
        var dst = link['destination'];
        var sourceId = findGraphObjId(
            graphObjPath(nwName, src['source-node'], src['source-tp']),
            nodeAndTp);
        var targetId = findGraphObjId(
            graphObjPath(nwName, dst['dest-node'], dst['dest-tp']),
            nodeAndTp);

        graphLinks.push({
            "source_id": sourceId,
            "target_id": targetId,
            "name": link['link-id'] // for label/matching/debug
        });
    });
    // node-tp link
    graphTps.forEach(function(tp) {
        graphLinks.push({
            "source_id": (Math.floor(tp['id'] / 100)) * 100,
            "target_id": tp['id'],
            "name": "node-tp:" + tp['path']
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

function makeNodeData(topoData) {
    var graphs = {};
    var nwNum = 1;
    topoData['ietf-network:networks']['network'].forEach(function(nw) {
        var graphNodes = makeGraphNodesFromTopoNodes(nwNum, nw['network-id'], nw['node']);
        var graphTps =  makeGraphTpsFromTopoNodes(nwNum, nw['network-id'], nw['node']);
        var graphLinks = makeGraphLinksFromTopoLinks(nw['network-id'], nw['ietf-network-topology:link'], graphNodes, graphTps);
        graphs[nw['network-id']] = {
            'nodes': graphNodes,
            'tps': graphTps,
            'links': graphLinks
        };
        nwNum++;
    });
    console.log(graphs);
    return graphs;
}

function drawGraphs(graphs) {
    var width = 2000;
    var height = 800;
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
            .attr("class", "network=" + nwName);
        drawGraph(simulation, nwLayer, graphs[nwName]);
    }
}

function drawGraph(simulation, nwLayer, graph) {
    graph.links.forEach(function(d) {
        d.source = d.source_id;
        d.target = d.target_id;
    });

    var link = nwLayer.append("g")
        .style("stroke", "#aaa")
        .selectAll("line")
        .data(graph.links)
        .enter()
        .append("line");

    var tp = nwLayer.append("g")
        .attr("class", "tp")
        .selectAll("circle")
        .data(graph.tps)
        .enter()
        .append("circle")
        .attr("id", function(d) { return d.path; })
        .call(d3.drag()
              .on("start", dragstarted)
              .on("drag", dragged)
              .on("end", dragended));

    var node = nwLayer.append("g")
        .attr("class", "node")
        .selectAll("rect")
        .data(graph.nodes)
        .enter()
        .append("rect")
        .attr("id", function(d) { return d.path; })
        .call(d3.drag()
              .on("start", dragstarted)
              .on("drag", dragged)
              .on("end", dragended));

    var nodeAndTp = graph.nodes.concat(graph.tps);

    var label = nwLayer.append("g")
        .attr("class", "labels")
        .selectAll("text")
        .data(nodeAndTp)
        .enter()
        .append("text")
        .attr("class", "label")
        .text(function(d) { return d.name; });

    simulation
        .nodes(nodeAndTp)
        .on("tick", ticked);

    simulation.force("link")
        .links(graph.links);

    function dragstarted(d) {
        if (!d3.event.active) {
            simulation.alphaTarget(0.3).restart();
        }
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(d) {
        console.log("dragged: ", d);
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    function dragended(d) {
        console.log("dragended: ", d);
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
