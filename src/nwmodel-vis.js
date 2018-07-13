"use strict";

function drawGraphs(graphs) {
    var allGraphNodes = makeAllGraphNodes(graphs);

    // highlight selected node
    function highlightNodeByPath(direction, path) {
        var element = document.getElementById(path);
        // console.log("highlight ", direction, path, element);
        element.classList.add("selected");
    }

    // clear all highlighted object
    function clearHighlight() {
        var element = document.getElementById("visualizer");
        var selectedElements = element.getElementsByClassName("selected");
        Array.from(selectedElements).forEach(function(element) {
            element.classList.remove("selected");
        });
    }

    // find nodes to highlight via through all layers
    function highlightNode(d) {
        function findSupportingObj(direction, path) {
            // highlight DOM
            highlightNodeByPath(direction, path);
            // recursive search
            var node = findGraphObjByPath(path, allGraphNodes);
            if(node[direction]) {
                node[direction].split(",").forEach(function(d) {
                    findSupportingObj(direction, d);
                });
            }
        }
        // clear all at first
        clearHighlight();
        // highlight selected object and its children/parents
        var path = d.getAttribute("id");
        console.log("highlight_top: ", path);
        findSupportingObj("children", path);
        findSupportingObj("parents", path);
    }

    // draw each layer
    for (var nwName in graphs) {
        drawGraph(nwName, graphs[nwName], highlightNode);
    }
}

function drawGraph(nwName, graph, highlightNode) {
    var graphSize = graph.nodes.length;
    // small
    var width = 400;
    var height = 400;
    if (50 < graphSize) {
        // large
        width = 2000;
        height = 1000;
    } else if (20 <= graphSize && graphSize < 50) {
        // medium
        width = 800;
        height = 800;
    }

    var nwLayer = d3.select("body")
        .select("div#visualizer")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g") // topology graph container
        .attr("id", nwName)
        .attr("class", "network");

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

    function mouseover(element) {
        element.classList.add("selectready");
    }

    function mouseout(element) {
        element.classList.remove("selectready");
    }

    var tp = nwLayer.append("g")
        .attr("class", "tp")
        .selectAll("circle")
        .data(graph.nodes.filter(function(d) { return d.type === "tp"; }))
        .enter()
        .append("circle")
        .attr("id", function(d) { return d.path; })
        .on("click", function() { highlightNode(this); })
        .on("mouseover", function() { mouseover(this); })
        .on("mouseout", function () { mouseout(this); })
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
        .on("click", function() { highlightNode(this); })
        .on("mouseover", function() { mouseover(this); })
        .on("mouseout", function () { mouseout(this); })
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

    var simulation = d3.forceSimulation()
        .force("link",
               d3.forceLink()
               .id(function(d) { return d.id; })
               .distance(linkDistance)
               .strength(linkStrength)
               .iterations(8)
              )
        .force("collide",
               d3.forceCollide()
               .radius(nodeCollideRadius)
               .strength(1.0) // collision not allowed
               .iterations(8)
              )
        .force("charge", d3.forceManyBody().strength(-50))
        .force("center", d3.forceCenter(width / 2, height / 2));

    simulation
        .nodes(graph.nodes)
        .on("tick", ticked)
        .force("link")
        .links(graph.links);

    var tpSize = 10; // tp circle radius
    var nodeSize = 40; // node width/height

    function nodeCollideRadius(d) {
        if (d.type === "node") {
            return 1.2 * nodeSize * 3 / 4;
        }
        return 1.2 * tpSize;
    }

    function linkDistance(d) {
        // ?? cannot use outer scope variable
        var x = 1.2 * 30; // 1.2 * nodeSize * 3 / 4
        if (d.type === "node-tp") {
            return x;
        }
        return 2 * x;
    }

    function linkStrength(d) {
        if (d.type == "node-tp") {
            return 1.0;
        }
        return 0.1;
    }

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

        tp
            .attr("r", tpSize)
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });

        node
            .attr("width", nodeSize)
            .attr("height", nodeSize)
            .attr("x", function(d) { return d.x - nodeSize / 2; })
            .attr("y", function(d) { return d.y - nodeSize / 2; })
            .attr("rx", nodeSize / 8)
            .attr("ry", nodeSize / 8);

        label
            .attr("x", function(d) { return d.x; })
            .attr("y", function(d) { return d.y; });
    }
}

function runNetworkModelVis(error, topoData) {
    if (error) {
        throw error;
    }
    drawGraphs(makeNodeData(topoData));
}

// Entry point
d3.json("http://localhost:8000/model/target.json", runNetworkModelVis);
