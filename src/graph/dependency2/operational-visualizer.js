import SingleDep2GraphVisualizer from './single-visualizer'

export default class OperationalDep2GraphVisualizer extends SingleDep2GraphVisualizer {
  clearHighlight () {
    if (!this.svg) {
      return // return if not ready svg (initial)
    }
    this.svg.selectAll('.selected')
      .classed('selected', false)
  }

  clearDependencyLines (lineClass) {
    const selector = lineClass ? `line.${lineClass}` : 'line'
    this.svg.selectAll(selector).remove()
  }

  _clearDepLineTp (lineClass) {
    this.svg.selectAll(`circle.${lineClass}`).classed(lineClass, false)
    this.svg.selectAll(`text.${lineClass}`).classed(lineClass, false)
  }

  _setDepLineTp (tp, lineClass) {
    this.svg.select(`circle[id='${tp.path}']`).classed(lineClass, true)
    this.svg.select(`text[id='${tp.path}-lb']`).classed(lineClass, true)
  }

  _clearDepLineTpVisibility (originPath) {
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

  makeDependencyLines (originPath, lineClass) {
    this._clearDepLineTpVisibility(originPath)
    // mark visible
    const originData = this.findObjByPath(originPath)
    const linesOfParents = this.getParentsTree(originData)
    const linesOfChildren = this.getChildrenTree(originData)
    // position calculation
    this.refreshGraphObjects()
    this._setOperationHandler()

    // dep line
    const lines = linesOfParents.concat(linesOfChildren)
    this.svg.selectAll(`line.dep2.${lineClass}`)
      .data(lines)
      .enter()
      .append('line')
      .attr('class', d => `dep2 ${lineClass} ${d.type}`)
      .attr('x1', d => d.src.x + this.p_r)
      .attr('y1', d => d.src.y + this.p_r)
      .attr('x2', d => d.dst.x + this.p_r)
      .attr('y2', d => d.dst.y + this.p_r)

    // highlight parent/children tp
    this._clearDepLineTp(lineClass)
    for (const line of lines) {
      this._setDepLineTp(line.src, lineClass)
      this._setDepLineTp(line.dst, lineClass)
    }
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

  clickHandler (d) {
    console.log(`click: ${d.path}`)
    this.clearDependencyLines('')
    this.makeDependencyLines(d.path, 'selected')
  }

  mouseOverHandler (d) {
    console.log(`mouseOver: ${d.path}`)
    if (!d.path) {
      return
    }
    this.makeDependencyLines(d.path, 'select-ready')
    this.tooltip.enableTooltip(d)
  }

  mouseOutHandler (d) {
    console.log(`mouseOut: ${d.path}`)
    if (!d.path) {
      return
    }
    this.clearDependencyLines('select-ready')
    this._clearDepLineTp('select-ready')
    this.tooltip.disableTooltip(d)
  }

  _setClearButtonHandler () {
    const mouseOver = () => {
      this.svg.select('text.clear-button')
        .classed('select-ready', true)
    }
    const mouseOut = () => {
      this.svg.select('text.clear-button')
        .classed('select-ready', false)
    }
    this.svg.select('text.clear-button')
      .on('click', () => {
        this.clearHighlight()
        this.clearDependencyLines('')
      })
      .on('mouseover', mouseOver)
      .on('mouseout', mouseOut)
  }

  _setOperationHandler () {
    // add event hunder to current svg object
    this.svg.selectAll('.dep2')
      .on('click', d => this.clickHandler(d))
      .on('mouseover', d => this.mouseOverHandler(d))
      .on('mouseout', d => this.mouseOutHandler(d))
  }

  setOperationHandler () {
    // for initialize (only called first time)
    this._setOperationHandler()
    this._setClearButtonHandler()
  }
}
