'use strict'

import * as d3 from 'd3'
import {GraphVisualizer} from './visualizer'

function drawLegend () {
  var legend = d3.select('body')
    .select('div#legend')
    .append('svg')
    .attr('width', 250)
    .attr('height', 110)

  var styles = [
    { 'class': 'normal', 'label': '' },
    { 'class': 'selectedchildren', 'label': 'child' },
    { 'class': 'selected', 'label': 'click' },
    { 'class': 'selectedparents', 'label': 'parent' }
  ]
  var objSize = 40
  var dp = 10

  function nodeCircleX (d, i) {
    return dp + objSize / 2 + (dp + objSize) * i
  }
  var nodeY = dp + objSize / 2
  legend.selectAll('circle.nodecircle')
    .data(styles)
    .enter()
    .append('circle')
    .attr('r', objSize / 2)
    .attr('cx', nodeCircleX)
    .attr('cy', nodeY)
    .attr('class', d => ['nodecircle', d.class].join(' '))
  legend.selectAll('circle.node')
    .data(styles)
    .enter()
    .append('circle')
    .attr('r', 0.75 * objSize / 2)
    .attr('cx', nodeCircleX)
    .attr('cy', nodeY)
    .attr('class', d => ['node', d.class].join(' '))
  var tpY = nodeY + objSize / 2 + dp + objSize / 4
  legend.selectAll('circle.tp')
    .data(styles)
    .enter()
    .append('circle')
    .attr('r', objSize / 4)
    .attr('cx', nodeCircleX)
    .attr('cy', tpY)
    .attr('class', d => ['tp', d.class].join(' '))
  var textY = tpY + objSize / 4 + dp * 2
  legend.selectAll('text')
    .data(styles)
    .enter()
    .append('text')
    .attr('x', (d, i) => nodeCircleX(d, i) - objSize / 2)
    .attr('y', textY)
    .text(d => d.label)
}

function drawSelection () {
  var select = d3.select('body')
    .select('div#modelselector')
    .append('select')
    .attr('id', 'modelselect')
    .on('change', onchange)
  var options = select.selectAll('option')
    .data(modelFiles)
    .enter()
    .append('option')
    .attr('value', d => d.value)
    .text(d => d.label)

  // set default selection
  var selectedFile = modelFiles.find(d => d.selected)
  options.filter(d => d.value === selectedFile.value)
    .attr('selected', true)

  function onchange () {
    var selectValue = d3.select('select').property('value')
    d3.select('body') // clear all graphs
      .select('div#visualizer')
      .selectAll('div.networklayer')
      .remove()
    drawJsonModel(selectValue)
  }
}

function drawJsonModel (file) {
  d3.json('http://localhost:8080/model/' + file, (error, topoData) => {
    if (error) {
      throw error
    }
    var visualizer = new GraphVisualizer(topoData)
    // for debug
    console.log('topology : ', visualizer.topoModel)
    console.log('graphs   : ', visualizer.graphs)
    // draw
    visualizer.drawGraphs()
  })
}

// Entry point
var modelFiles = [
  {
    'selected': true,
    'value': 'target3.json',
    'label': 'L2 Aggregated Model'
  },
  {
    'selected': false,
    'value': 'target2.json',
    'label': 'L2 Compact Model'
  },
  {
    'selected': false,
    'value': 'target.json',
    'label': 'L2 Verbose Model'
  }
]
drawLegend()
drawSelection()
drawJsonModel(modelFiles.find(d => d.selected).value)
