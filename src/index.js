'use strict'

import * as d3 from 'd3'
import {GraphVisualizer} from './visualizer'
import './nwmodel-vis.scss'
import 'json-editor'

function drawLegend () {
  const styles = [
    { 'class': 'normal', 'label': 'normal' },
    { 'class': 'selectready', 'label': 'select' },
    { 'class': 'selected', 'label': 'click' },
    { 'class': 'selectedchildren', 'label': 'child' },
    { 'class': 'selectedparents', 'label': 'parent' }
  ]
  const objSize = 40
  const xdp = 30
  const ydp = 10
  const legend = d3.select('body')
    .select('div#legend')
    .append('svg')
    .attr('width', xdp + (xdp + objSize) * styles.length)
    .attr('height', ydp + objSize + ydp + objSize / 2 + ydp * 3)
  const nodeY = ydp + objSize / 2

  const nodeCircleX = (d, i) => {
    return xdp + objSize / 2 + (xdp + objSize) * i
  }

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
    .attr('r', 0.7 * objSize / 2)
    .attr('cx', nodeCircleX)
    .attr('cy', nodeY)
    .attr('class', d => ['node', d.class].join(' '))

  const tpY = nodeY + objSize / 2 + ydp + objSize / 4
  legend.selectAll('circle.tp')
    .data(styles)
    .enter()
    .append('circle')
    .attr('r', objSize / 4)
    .attr('cx', nodeCircleX)
    .attr('cy', tpY)
    .attr('class', d => ['tp', d.class].join(' '))

  const textY = tpY + objSize / 4 + ydp * 2
  legend.selectAll('text')
    .data(styles)
    .enter()
    .append('text')
    .attr('x', (d, i) => nodeCircleX(d, i) - objSize / 2)
    .attr('y', textY)
    .text(d => d.label)
}

function drawSelection () {
  const modelSelector = d3.select('body')
    .select('div#modelselector')
    .append('select')
    .attr('id', 'modelselect')
    .on('change', () => {
      const selectValue = d3.select('select').property('value')
      d3.select('body') // clear all graphs
        .select('div#visualizer')
        .selectAll('div.networklayer')
        .remove()
      drawJsonModel(selectValue)
    })
  const options = modelSelector.selectAll('option')
    .data(modelFiles)
    .enter()
    .append('option')
    .attr('value', d => d.value)
    .text(d => d.label)

  // set default selection
  const selectedFile = modelFiles.find(d => d.selected)
  options.filter(d => d.value === selectedFile.value)
    .attr('selected', true)
}

function drawJsonModel (file) {
  d3.json(`/model/${file}`, (error, topoData) => {
    if (error) {
      throw error
    }
    topoData = value
    applyJsonModel()
  })
}

function applyJsonModel () {
    const visualizer = new GraphVisualizer(topoData)
    // for debug
    console.log('topology : ', visualizer.topoModel)
    console.log('graphs   : ', visualizer.graphs)
    // draw
    visualizer.drawGraphs()
}

function drawEditButton () {
  d3.select('body')
    .select('div#edit')
    .append('button')
    .attr('type', 'button')
    .attr('class', 'btn-btn')
    .on('click', onClick)
    .append('div')
    .text('Edit')

  function onClick () {
    drawDesign()
  }
}

function drawPresentation() {
  d3.select('body')
    .select('div#design')
    .style('display', 'none')

  d3.select('body')
    .select('div#editor')
    .remove()

  d3.select('body')
    .select('div#presentation')
    .style('display', '')
}

function drawDesign () {
  d3.select('body')
    .select('div#presentation')
    .style('display', 'none')

  d3.select('body')
    .select('div#editor')
    .remove()

 var editorNode = d3.select('body')
    .select('div#design')
    .append('div')
    .attr('id', 'editor')
    .node()

  d3.select('body')
    .select('div#editor')
    .append('button')
    .attr('type', 'button')
    .attr('class', 'btn-btn')
    .on('click', onClickApply)
    .append('div')
    .text('Apply')

  d3.select('body')
    .select('div#editor')
    .append('button')
    .attr('type', 'button')
    .attr('class', 'btn-btn')
    .on('click', onClickCancel)
    .append('div')
    .text('Cancel')

  d3.select('body')
    .select('div#editor')
    .append('input')
    .attr('type', 'file')
    .attr('id', 'file')
    .on('change', onChangeFile)

  var editor = new JSONEditor(editorNode, {
    ajax: true,
    schema: {
      $ref: "/model/schema.json"
    },
    startval: topoData
  })

  d3.select('body')
    .select('div#design')
    .style('display', '')

  function onClickApply () {
    topoData = editor.getValue()
    d3.select('body') // clear all graphs
      .select('div#visualizer')
      .selectAll('div.networklayer')
      .remove()
    drawPresentation()
    applyJsonModel()
  }

  function onClickCancel () {
    drawPresentation()
  }

  function onChangeFile(e) {
    if (window.File && window.FileReader && window.FileList && window.Blob) {
    } else {
        alert('The File APIs are not supported in this browser.')
        return
    }

    if (!window.confirm('Data will be overwritten. Are you sure?')) {
      d3.select('body')
        .select('div#editor')
        .select('input#file')
        .property('value', '')
      return
    }

    var file = event.target.files[0]
    var reader = new FileReader()

    reader.onload = function(event) {
      d3.json(event.target.result, function(error, value) {
        editor.setValue(value)
        alert('Load completed.')

        d3.select('body')
          .select('div#editor')
          .select('input#file')
          .property('value', '')
       })
    }
    reader.readAsDataURL(file)
  }
}

var topoData = null

// Entry point
const modelFiles = [
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
drawEditButton()
drawPresentation()
drawJsonModel(modelFiles.find(d => d.selected).value)
