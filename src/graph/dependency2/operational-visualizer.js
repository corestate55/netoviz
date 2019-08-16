import SingleDep2GraphVisualizer from './single-visualizer'
import { event, selectAll } from 'd3-selection'
import { zoom } from 'd3-zoom'
import { drag } from 'd3-drag'

export default class OperationalDep2GraphVisualizer extends SingleDep2GraphVisualizer {
  clearHighlight () {
    if (!this.svgGrp) {
      return // return if not ready svg (initial)
    }
    this.svgGrp.selectAll('.selected').classed('selected', false)
  }

  clearDependencyLines (lineClass) {
    const selector = lineClass ? `.${lineClass}` : ''
    this.svgGrp.selectAll(`line${selector}`).remove()
    this.svgGrp.selectAll(`circle${selector}`).classed(lineClass, false)
    this.svgGrp.selectAll(`text${selector}`).classed(lineClass, false)
  }

  clearAllSelection () {
    this.clearHighlight()
    this.clearDependencyLines('')
  }

  _setDependencyLineTp (tp, lineClass) {
    this.svgGrp.select(`circle[id='${tp.path}']`).classed(lineClass, true)
    this.svgGrp.select(`text[id='${tp.path}-lb']`).classed(lineClass, true)
  }

  _clearDependencyLineTpVisibility (originPath) {
    let targetNodePath = ''
    if (originPath.split('__').length > 2) {
      const p = originPath.split('__')
      p.pop()
      targetNodePath = p.join('__')
    } else {
      targetNodePath = originPath
    }

    const pathRegexp = new RegExp(`${targetNodePath}__`)
    for (const nwObjs of this.drawGraphData) {
      nwObjs
        .filter(d => d.type === 'tp' && d.visible && !d.path.match(pathRegexp))
        .forEach(d => { d.visible = false })
    }
  }

  reCalculatePositionOfVisibleObject () {
    // clear all to avoid leaving selected/select-ready dep lines
    // which created before node position changes.
    this.clearAllSelection()
    // position calculation
    this.refreshGraphObjects()
    this._setOperationHandler()
  }

  _makeDependencyLines (lines, lineClass) {
    this.svgGrp.selectAll(`line.dep2.${lineClass}`)
      .data(lines)
      .enter()
      .append('line')
      .attr('class', d => `dep2 ${lineClass} ${d.type}`)
      .attr('x1', d => d.src.x + this.p_r)
      .attr('y1', d => d.src.y + this.p_r)
      .attr('x2', d => d.dst.x + this.p_r)
      .attr('y2', d => d.dst.y + this.p_r)
  }

  _highlightDependencyLineTp (lines, lineClass) {
    for (const line of lines) {
      this._setDependencyLineTp(line.src, lineClass)
      this._setDependencyLineTp(line.dst, lineClass)
    }
  }

  makeDependencyLines (originPath, lineClass) {
    this._clearDependencyLineTpVisibility(originPath)
    // mark visible
    const originData = this.findObjByPath(originPath)
    const linesOfParents = this.getParentsTree(originData)
    const linesOfChildren = this.getChildrenTree(originData)
    this.reCalculatePositionOfVisibleObject()
    // make line
    const lines = linesOfParents.concat(linesOfChildren)
    this._makeDependencyLines(lines, lineClass)
    this._highlightDependencyLineTp(lines, lineClass)
  }

  getParentsTree (objData) {
    const pathList = []
    objData.visible = true
    for (const parentPath of objData.parents) {
      const parentObjData = this.findObjByPath(parentPath)
      if (parentObjData) {
        parentObjData.visible = true
        pathList.push({
          'type': objData.type,
          'src': objData,
          'dst': parentObjData
        })
        // push parent and parents of parent
        pathList.push(this.getParentsTree(parentObjData))
      }
    }
    return this.flatten(pathList)
  }

  getChildrenTree (objData) {
    const pathList = []
    objData.visible = true
    for (const childPath of objData.children) {
      const childObjData = this.findObjByPath(childPath)
      if (childObjData) {
        childObjData.visible = true
        pathList.push({
          'type': objData.type,
          'src': childObjData,
          'dst': objData
        })
        // push child and children of child
        pathList.push(this.getChildrenTree(childObjData))
      }
    }
    return this.flatten(pathList)
  }

  _nwPath (path) {
    return path.split('__').shift() // head of path string
  }

  findObjByPath (path) {
    return this.reduceDrawGraphDataToList().find(d => d.path === path)
  }

  findNeworkObjHas (path) {
    const nwPath = path.split('__').shift()
    return this.reduceDrawGraphDataToList().find(d => d.path === nwPath)
  }

  clickHandler (d) {
    // console.log(`click: ${d.path}`)
    this.clearDependencyLines('')
    this.makeDependencyLines(d.path, 'selected')
  }

  mouseOverHandler (d) {
    // console.log(`mouseOver: ${d.path}`)
    if (!d.path) {
      return
    }
    this.makeDependencyLines(d.path, 'select-ready')
    this.tooltip.enableTooltip(d)
  }

  mouseOutHandler (d) {
    // console.log(`mouseOut: ${d.path}`)
    if (!d.path) {
      return
    }
    this.clearDependencyLines('select-ready')
    this.tooltip.disableTooltip(d)
  }

  _setClearButtonHandler () {
    const mouseOver = () => {
      this.svg.select('text#clear-button')
        .classed('select-ready', true)
    }
    const mouseOut = () => {
      this.svg.select('text#clear-button')
        .classed('select-ready', false)
    }
    this.svg.select('text#clear-button')
      .on('click', () => {
        this.clearHighlight()
        this.clearDependencyLines('')
      })
      .on('mouseover', mouseOver)
      .on('mouseout', mouseOut)
  }

  toggleActiveDiff () {
    const visualizer = selectAll('div#visualizer')
    visualizer.selectAll(`.${this.currentInactive}`)
      .classed('inactive', false)
      .classed('active', true)
    this.currentInactive = this.currentInactive === 'deleted' ? 'added' : 'deleted'
    visualizer.selectAll(`.${this.currentInactive}`)
      .classed('inactive', true)
      .classed('active', false)
  }

  _setToggleActiveDiffButtonHandler () {
    const mouseOver = () => {
      this.svg.select('text#diff-toggle-button')
        .classed('select-ready', true)
    }
    const mouseOut = () => {
      this.svg.select('text#diff-toggle-button')
        .classed('select-ready', false)
    }
    this.svg.select('text#diff-toggle-button')
      .on('click', this.toggleActiveDiff)
      .on('mouseover', mouseOver)
      .on('mouseout', mouseOut)
  }

  _moveNetworkLayer (path, dy) {
    const nwObj = this.findNeworkObjHas(path)
    if (nwObj) {
      nwObj.y += dy
    }
    this.reCalculatePositionOfVisibleObject()
  }

  _setOperationHandler () {
    const dragStarted = (d) => {
      d.dragY = event.y
    }
    const dragged = (d) => {
      this._moveNetworkLayer(d.path, event.y - d.dragY)
      d.dragY = event.y
    }
    const dragEnded = (d) => {
      delete d.dragY
    }

    // add event hunder to current svg object
    this.svgGrp.selectAll('.dep2')
      .on('click', d => this.clickHandler(d))
      .on('mouseover', d => this.mouseOverHandler(d))
      .on('mouseout', d => this.mouseOutHandler(d))
      .call(drag()
        .on('start', dragStarted)
        .on('drag', dragged)
        .on('end', dragEnded)
      )
  }

  _setSVGZoom () {
    this.svg.call(zoom()
      .scaleExtent([1 / 4, 5])
      .on('zoom', () => this.svgGrp.attr('transform', event.transform))
    )
  }

  setOperationHandler () {
    // for initialize (only called first time)
    this._setSVGZoom()
    this._setOperationHandler()
    this._setClearButtonHandler()
    this._setToggleActiveDiffButtonHandler()
  }
}
