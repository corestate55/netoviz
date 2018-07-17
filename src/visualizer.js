'use strict'

import {Graphs} from './graphs'
import {SingleGraphVisualizer} from './single-visualizer'

export class GraphVisualizer extends Graphs {
  constructor (topoData) {
    super(topoData)
  }

  drawGraphs () {
    var self = this // alias to use event callback closure

    // highlight selected node
    function highlightNodeByPath (direction, path) {
      var element = document.getElementById(path)
      if (direction === 'children') {
        element.classList.add('selectedchildren')
      } else if (direction === 'parents') {
        element.classList.add('selectedparents')
      } else {
        ['selectedchildren', 'selectedparents'].forEach((d) => {
          element.classList.remove(d)
        })
        element.classList.add('selected')
      }
    }

    // event callback
    // find nodes to highlight via through *all* layers
    function highlightNode (d) {
      function findSupportingObj (direction, path) {
        // highlight DOM
        console.log('....', direction, path)
        highlightNodeByPath(direction, path)
        // recursive search
        var node = self.findNodeByPath(path)
        if (node[direction]) {
          node[direction].forEach((d) => {
            findSupportingObj(direction, d)
          })
        }
      }
      // highlight selected object and its children/parents
      var path = d.getAttribute('id')
      console.log('highlight_top: ', path)
      findSupportingObj('children', path)
      findSupportingObj('parents', path)
      findSupportingObj('clicked', path) // dummy direction
    }

    // entrypoint: draw each layer
    this.graphs.forEach((graph) => {
      var sgv = new SingleGraphVisualizer(graph)
      sgv.setHighlightNodeCallback(highlightNode)
      sgv.draw()
    })
  }
}
