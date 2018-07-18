'use strict'

import {Graphs} from './graphs'
import {SingleGraphVisualizer} from './single-visualizer'

export class GraphVisualizer extends Graphs {
  constructor (topoData) {
    super(topoData)
  }

  drawGraphs () {
    var self = this // alias to use event callback closure

    function clearElementHighlight (element) {
      ['selectedchildren', 'selectedparents', 'selected'].forEach(
        d => element.classList.remove(d)
      )
    }

    // highlight selected node
    function highlightNodeByPath (direction, path) {
      var element = document.getElementById(path)
      clearElementHighlight(element)
      if (direction === 'children') {
        element.classList.add('selectedchildren')
      } else if (direction === 'parents') {
        element.classList.add('selectedparents')
      } else {
        element.classList.add('selected')
      }
    }

    // event callback
    function highlightNode (element) {
      function findSupportingObj (direction, path) {
        // highlight DOM
        console.log('....', direction, path)
        highlightNodeByPath(direction, path)
        // find nodes to highlight via through *all* layers
        var node = self.findGraphNodeByPath(path)
        if (node[direction]) {
          // search children/parent recursively
          node[direction].forEach(
            d => findSupportingObj(direction, d)
          )
        } else {
          console.log('attribute: ', node.attribute)
        }
      }
      // highlight selected object and its children/parents
      var path = element.getAttribute('id')
      console.log('highlight_top: ', path)
      findSupportingObj('children', path)
      findSupportingObj('parents', path)
      findSupportingObj('clicked', path) // dummy direction
    }

    // entrypoint: draw each layer
    this.graphs.forEach(graph => {
      var sgv = new SingleGraphVisualizer(graph)
      // handout operation through all layers
      sgv.setHighlightNodeCallback(highlightNode)
      sgv.draw()
    })
  }
}
