'use strict'

import { json } from 'd3-request'
import { GraphVisualizer } from './visualizer/visualizer'
import { DependencyGraphVisualizer } from './dependency-visualizer/visualizer'
import { select } from 'd3-selection'
import { drawLegend } from './visualizer/legend'
import './netoviz.scss'

class VisualizerControl {
  constructor () {
    this.visualizerTable = {
      'topology': new GraphVisualizer(),
      'dependency': new DependencyGraphVisualizer()
    }
    this.visualizer = undefined // default
    this.jsonName = ''
  }

  drawGraph () {
    console.log(this.visualizer)
    this.visualizerTable[this.visualizer].drawJsonModel(this.jsonName)
  }

  drawModelSelector (modelList) {
    const modelSelector = select('body')
      .select('div#model-selector')
      .append('select')
      .attr('id', 'model-select')
      .on('change', () => {
        this.jsonName = select('select').property('value')
        this.drawGraph()
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
    this.jsonName = selectedFile.value
  }

  drawVisualizerSelector () {
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
      .on('change', (elm) => {
        this.visualizer = elm.value
        this.drawGraph()
      })
    visSelector.selectAll('li')
      .append('label')
      .attr('for', d => d.id)
      .text(d => d.label)

    // default selection
    const checkedSelector = visSelectorData.find(d => d.checked)
    this.visualizer = checkedSelector.value
    visSelector.selectAll(`input#${checkedSelector.id}`)
      .attr('checked', true)
  }

  startApp () {
    drawLegend()
    this.drawVisualizerSelector()
    json('/index.json', (error, modelList) => {
      if (error) {
        throw error
      }
      this.drawModelSelector(modelList)
      this.drawGraph()
    })
  }
}

const visController = new VisualizerControl()
visController.startApp()
