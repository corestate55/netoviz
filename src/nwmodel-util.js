"use strict";

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

function makeAllGraphNodes(graphs) {
    var allGraphNodes = [];
    for (var nwName in graphs) {
        // concatenate nodes in all layers
        allGraphNodes = allGraphNodes.concat(graphs[nwName].nodes);
    }
    return allGraphNodes;
}
