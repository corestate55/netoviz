import SingleVisualizerBase from '../common/single-visualizer-base'

export default class SingleDep2GraphVisualizer extends SingleVisualizerBase {
  constructor (width, height) {
    super()
    // canvas size
    this.width = width
    this.height = height
    // constants
    this.layer_xpad1 = 10
    this.layer_xpad2 = 160
    this.layer_ypad = 40
    this.label_xpad = 5
    this.p_ypad = 30
    this.p_xpad = 8
    this.p_r = 10
    this.fontSize = 18
  }

  makeDrawNetworkData (nw) {
    return {
      visible: true,
      type: 'network',
      name: nw.name,
      path: nw.path,
      x: null, // must be initialized
      y: null,
      parents: [], // TODO: support-network (parents/children) is ignored (currently)
      children: [],
      attribute: nw.attribute || {}, // TODO: network attribute is ignored
      diffState: nw.diffState || {} // TODO: network diffState is ignored
    }
  }

  makeDrawGraphData (graphData) {
    const objects = []
    for (const nw of graphData) {
      // head (network)
      const nwObjs = [this.makeDrawNetworkData(nw)]
      for (const node of nw.nodes) {
        // append node
        node.visible = true
        nwObjs.push(node)
        // append tps in node
        const tps = nw.tps.filter(d => this.matchChildPath(node.path, d.path))
        if (tps) {
          // initial: nw.tps is not used (all nodes are closed)
          tps.forEach(tp => {
            tp.visible = false
            return tp
          })
          nwObjs.push(tps)
        }
      }
      objects.push(this.flatten(nwObjs))
    }
    return objects
  }

  _deleteUnusedPropsOf (object) {
    delete object.number
    delete object.width
    delete object.height
    delete object.cx
    delete object.cy
    delete object.r
  }

  _deleteUnusedProps (graphData) {
    for (const nwObjs of graphData) {
      for (const nwObj of nwObjs.nodes) {
        this._deleteUnusedPropsOf(nwObj)
      }
      for (const nwObj of nwObjs.tps) {
        this._deleteUnusedPropsOf(nwObj)
      }
    }
  }

  _indentOf (nwObj) {
    const type2indentNum = {
      network: 0,
      node: 1,
      tp: 2
    }
    return type2indentNum[nwObj.type]
  }

  calculatePositionOfDrawGraphData () {
    for (let i = 0; i < this.drawGraphData.length; i++) {
      const nwObjects = this.drawGraphData[i] // a list of layer entries
      if (nwObjects[0].x == null || nwObjects[0].y == null) {
        // initialize layer head position (layer head must be type==network)
        nwObjects[0].x = this.layer_xpad1 + i * this.layer_xpad2
        nwObjects[0].y = this.layer_ypad
      }
      let v = 1
      for (let j = 1; j < nwObjects.length; j++) {
        if (!nwObjects[j].visible) {
          continue
        }
        nwObjects[j].x =
          nwObjects[0].x + this._indentOf(nwObjects[j]) * this.p_xpad
        nwObjects[j].y = nwObjects[0].y + v * this.p_ypad
        v++
      }
    }
  }

  reduceDrawGraphDataToList () {
    const callback = (acc, curr) => acc.concat(curr)
    return this.drawGraphData ? this.drawGraphData.reduce(callback, []) : []
  }

  _visibleDrawGraphData () {
    return this.reduceDrawGraphDataToList().filter(d => d.visible)
  }

  makeEntryCircles () {
    const updatedEntries = this.svgGrp
      .selectAll('circle.dep2')
      .data(this._visibleDrawGraphData())
    const enteredEntries = updatedEntries.enter().append('circle')
    updatedEntries.exit().remove()
    const targetEntries = enteredEntries.merge(updatedEntries)
    targetEntries
      .attr('class', d => this.objClassDef(d, `dep2 ${d.type}`))
      .attr('id', d => d.path)
      .attr('cx', d => d.x + this.p_r)
      .attr('cy', d => d.y + this.p_r)
      .attr('r', this.p_r)
  }

  makeEntryLabels () {
    const updatedEntries = this.svgGrp
      .selectAll('text.dep2')
      .data(this._visibleDrawGraphData())
    const enteredEntries = updatedEntries.enter().append('text')
    updatedEntries.exit().remove()
    const targetEntries = enteredEntries.merge(updatedEntries)
    targetEntries
      .attr('class', d => this.objClassDef(d, `dep2 ${d.type}`))
      .attr('id', d => `${d.path}-lb`)
      .attr('x', d => d.x + 2 * this.p_r + this.label_xpad)
      .attr('y', d => d.y + this.fontSize)
      .attr('font-size', this.fontSize)
      .text(d => d.name)
  }

  refreshGraphObjects () {
    this.calculatePositionOfDrawGraphData()
    this.makeEntryCircles()
    this.makeEntryLabels()
  }

  makeDependencyLineSVGGroup () {
    // group to insert dependency lines under other point-circles and labels.
    this.depLineSVGGrp = this.svgGrp.append('g').attr('id', 'dep-lines')
  }

  makeGraphObjects (graphData) {
    this._deleteUnusedProps(graphData)
    this.makeGraphSVG('dependency2-view', null, 'whole-dep2-graph')
    this.makeDependencyLineSVGGroup()
    this.makeGraphControlButtons()
    this.drawGraphData = this.makeDrawGraphData(graphData)
    this.refreshGraphObjects()
  }
}
