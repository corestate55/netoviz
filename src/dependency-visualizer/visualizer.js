import { json } from 'd3-request'
import { select } from 'd3-selection'

export class DependencyGraphVisualizer {
  constructor () {
  }

  drawJsonModel (jsonName) {
    // URL draw-dep-graph/:jsonName is the API
    // that convert topology json (model/:jsonName)
    // to graph object data by json format.
    json(`draw-dep-graph/${jsonName}`, (error, graphData) => {
      if (error) {
        throw error
      }
      this.clearCanvas()
      this.makeNodes(graphData)
    })
  }

  clearCanvas () {
    // clear graphs
    select('div#visualizer') // clear all graphs
      .selectAll('div.network-layer')
      .remove()
  }

  makeNodes (graphData) {
    const svg = select('body').select('div#visualizer')
      .append('div') // to keep compatibility with topology visualizer
      .attr('class', 'network-layer')
      .append('svg')
    const fontSize = 12

    // for each layer
    svg
      .attr('width', 1500)
      .attr('height', 800)
    const layerLabelGroup = svg.append('g')
      .attr('class', 'layer-labels')

    // layer label
    layerLabelGroup.selectAll('text')
      .data(graphData)
      .enter()
      .append('text')
      .attr('x', d => d.x)
      .attr('y', d => d.y + d.height / 2)
      .attr('class', 'dep layer')
      .text(d => d.name)

    // for each node/tp
    for (const layer of graphData) {
      const layerObjGroup = svg.append('g')
        .attr('class', 'layer-objects')
      layerObjGroup.selectAll('rect')
        .data(layer.nodes)
        .enter()
        .append('rect')
        .attr('class', 'dep')
        .attr('x', d => d.x)
        .attr('y', d => d.y)
        .attr('rx', 5)
        .attr('ry', 5)
        .attr('width', d => d.width)
        .attr('height', d => d.height)
        .append('title')
        .text(d => d.path)
      layerObjGroup.selectAll('circle')
        .data(layer.tps)
        .enter()
        .append('circle')
        .attr('class', 'dep')
        .attr('cx', d => d.cx)
        .attr('cy', d => d.cy)
        .attr('r', d => d.r)
        .append('title')
        .text(d => d.path)

      // label
      layerObjGroup.selectAll('text.node')
        .data(layer.nodes)
        .enter()
        .append('text')
        .attr('class', 'dep node')
        .attr('x', d => d.x)
        .attr('y', d => d.y + d.height)
        .attr('dy', fontSize)
        .text(d => d.name)
      layerObjGroup.selectAll('text.tp')
        .data(layer.tps)
        .enter()
        .append('text')
        .attr('class', 'dep tp')
        .attr('x', d => d.cx)
        .attr('y', d => d.cy + d.r)
        .attr('dy', fontSize / 2)
        .text(d => d.name)
    }
  }
}
