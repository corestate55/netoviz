'use strict'

import { json } from 'd3-request'
import { GraphVisualizer } from './visualizer/visualizer'
import { select } from 'd3-selection'
import { drawLegend } from './visualizer/legend'
import './netoviz.scss'

// visualizer
const visualizer = new GraphVisualizer()

function drawModelSelector (modelList) {
  const modelSelector = select('body')
    .select('div#model-selector')
    .append('select')
    .attr('id', 'model-select')
    .on('change', () => {
      const jsonName = select('select').property('value')
      visualizer.drawJsonModel(jsonName)
    })
  const options = modelSelector.selectAll('option')
    .data(modelList)
    .enter()
    .append('option')
    .attr('value', d => d.value)
    .text(d => d.label)

  // set default selection
  const selectedFile = modelList.find(d => d.selected)
  options.filter(d => d.value === selectedFile.value)
    .attr('selected', true)
}

function drawVisualizerSelector () {
  const visSelectorData = [
    {
      'checked': true,
      'id': 'topology-graph-selector',
      'value': 'topology',
      'label': 'Topology graph'
    },
    {
      'checked': false,
      'id': 'dependency-graph-selector',
      'value': 'dependency',
      'label': 'Dependency graph'
    }
  ]

  const changeVisualizer = (elm) => {
    console.log(elm)
  }

  const visSelector = select('body')
    .select('div#visualizer-selector')
    .append('ul')
  visSelector.selectAll('li')
    .data(visSelectorData)
    .enter()
    .append('li')
    .append('input')
    .attr('type', 'radio')
    .attr('name', 'visualizer-select')
    .attr('id', d => d.id)
    .attr('value', d => d.value)
    .on('change', changeVisualizer)
  visSelector.selectAll('li')
    .append('label')
    .attr('for', d => d.id)
    .text(d => d.label)

  // default selection
  const checkedSelector = visSelectorData.find(d => d.checked)
  visSelector.selectAll(`input#${checkedSelector.id}`)
    .attr('checked', true)
}

// Entry point
drawVisualizerSelector()
json('/index.json', (error, modelList) => {
  if (error) {
    throw error
  }
  drawLegend()
  drawModelSelector(modelList)
  const jsonName = modelList.find(d => d.selected).value
  visualizer.drawJsonModel(jsonName)
})
