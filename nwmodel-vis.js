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
            "type": "node",
            "name": node['node-id'],
            "id": graphObjId(nwNum, nodeNum, 0),
            "path": graphObjPath(nwName, node['node-id'], null)
        });
        // node as termination point
        var tpKey = 'ietf-network-topology:termination-point'; // alias
        if(node[tpKey]) {
            var tpNum = 1;
            node[tpKey].forEach(function(tp) {
                graphNodes.push({
                    "type": "tp",
                    "name": tp['tp-id'],
                    "id": graphObjId(nwNum, nodeNum, tpNum),
                    "path": graphObjPath(nwName, node['node-id'], tp['tp-id'])
                });
                tpNum++;
            });
        }
        nodeNum++;
    });
    return graphNodes;
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

function makeGraphLinksFromTopoLinks(nwName, topoLinks, graphNodes) {
    var graphLinks = [];

    // tp-tp link
    topoLinks.forEach(function(link) {
        var src = link['source'];
        var dst = link['destination'];
        var sourceId = findGraphObjId(
            graphObjPath(nwName, src['source-node'], src['source-tp']),
            graphNodes);
        var targetId = findGraphObjId(
            graphObjPath(nwName, dst['dest-node'], dst['dest-tp']),
            graphNodes);

        graphLinks.push({
            "source_id": sourceId,
            "target_id": targetId,
            "name": link['link-id'] // for label/matching/debug
        });
    });
    // node-tp link
    graphNodes.forEach(function(node) {
        if(node['type'] == 'tp') {
            graphLinks.push({
                "source_id": (Math.floor(node['id'] / 100)) * 100,
                "target_id": node['id'],
                "name": "node-tp:" + node['path']
            });
        }
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
        var graphLinks = makeGraphLinksFromTopoLinks(nw['network-id'], nw['ietf-network-topology:link'], graphNodes);
        graphs[nw['network-id']] = {
            'nodes': graphNodes,
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

    var node = nwLayer.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(graph.nodes)
        .enter()
        .append("circle")
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

        node
            .attr("r", 20)
            .style("fill", "#d9d9d9")
            .style("stroke", "#969696")
            .style("stroke-width", "1px")
            .attr("cx", function (d) { return d.x+6; })
            .attr("cy", function(d) { return d.y-6; });

        label
            .attr("x", function(d) { return d.x; })
            .attr("y", function (d) { return d.y; })
            .style("font-size", "20px").style("fill", "#4393c3");
    }
}
