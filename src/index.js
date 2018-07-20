'use strict'

import * as d3 from 'd3'
import {GraphVisualizer} from './visualizer'

function drawLegend () {
  var legend = d3 // .select(document.body)
    .select('body')
    .append('div')
    .attr('id', 'legend')
    .append('svg')
    .attr('width', 500)
    .attr('height', 60)

  var styles = [
    { 'class': 'normal', 'label': '' },
    { 'class': 'selectedchildren', 'label': 'child' },
    { 'class': 'selected', 'label': 'click' },
    { 'class': 'selectedparents', 'label': 'parent' }
  ]
  var objSize = 40
  var dp = 10

  function circleX (d, i) {
    return (dp + objSize) * (1 + styles.length + i)
  }

  legend.selectAll('circle.node')
    .data(styles)
    .enter()
    .append('circle')
    .attr('r', objSize / 2)
    .attr('cx', (d, i) => dp + objSize / 2 + (dp + objSize) * i)
    .attr('cy', objSize / 2 + dp)
    .attr('class', d => ['node', d.class].join(' '))
  legend.selectAll('circle.tp')
    .data(styles)
    .enter()
    .append('circle')
    .attr('r', objSize / 4)
    .attr('cx', circleX)
    .attr('cy', objSize / 2)
    .attr('class', d => ['tp', d.class].join(' '))
  legend.selectAll('text')
    .data(styles)
    .enter()
    .append('text')
    .attr('x', circleX)
    .attr('y', objSize + dp)
    .text(d => d.label)
}

function drawSelection () {
  var select = d3.select('body')
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
