import { zoom } from 'd3-zoom'
import { event } from 'd3-selection'
import { SingleDepGraphVisualizer } from './single-visualizer'

export class OperationalDepGraphVisualizer extends SingleDepGraphVisualizer {
  constructor () {
    super()
  }

  clearHighlight () {
    this.svgGrp.selectAll('.selected')
      .classed('selected', false)
    this.svgGrp.selectAll('.selected-origin')
      .classed('selected-origin', false)
  }

  clearDependencyLines (lineClass) {
    const selector = lineClass ? `line.${lineClass}` : 'line'
    this.depLineGrp.selectAll(selector)
      .remove()
  }

  makeTpDepLine (lineClass, src, dst) {
    this.depLineGrp.append('line')
      .attr('class', `dep tp ${lineClass}`)
      .attr('x1', src.cx)
      .attr('y1', src.cy < dst.cy ? src.cy + src.r : src.cy - src.r)
      .attr('x2', dst.cx)
      .attr('y2', src.cy < dst.cy ? dst.cy - dst.r : dst.cy + dst.r)
      .attr('marker-end', 'url(#tp-dep-arrow-end)')
  }

  makeNodeDepLine (lineClass, src, dst) {
    this.depLineGrp.append('line')
      .attr('class', `dep node ${lineClass}`)
      .attr('x1', src.x + src.width / 2)
      .attr('y1', src.y < dst.y ? src.y + src.height : src.y)
      .attr('x2', dst.x + dst.width / 2)
      .attr('y2', src.y < dst.y ? dst.y : dst.y + dst.height)
      .attr('marker-end', 'url(#node-dep-arrow-end)')
  }

  makeDependencyLines (lines, lineClass) {
    for (const line of lines) {
      if (line.src.type !== line.dst.type) {
        continue
      }
      if (line.src.type === 'tp') {
        this.makeTpDepLine(lineClass, line.src, line.dst)
      } else if (line.src.type === 'node') {
        this.makeNodeDepLine(lineClass, line.src, line.dst)
      }
    }
  }

  pathsFromPairs (selfObj, pairs) {
    // without sort-uniq,
    // parents/children tree contains duplicated element.
    // when toggle odd times the element, highlight was disabled.
    return this.sortUniq(
      this.flatten([selfObj.path, pairs.map(d => d.dst.path)])
    )
  }

  runParentsAndChildren (selfObj, actionForPairs, actionForOrigin, actionForTargets) {
    const parentPairs = this.getParentsTree(selfObj)
    const parentPaths = this.pathsFromPairs(selfObj, parentPairs)
    const childPairs = this.getChildrenTree(selfObj)
    const childPaths = this.pathsFromPairs(selfObj, childPairs)

    // action for each pairs(line: src/dst)
    actionForPairs(parentPairs.concat(childPairs))
    // action for mouse event origin
    actionForOrigin(selfObj.path)
    // action for each parents/children
    actionForTargets(this.flatten([parentPaths, childPaths]))
  }

  setMouseEventsToGraphObject () {
    const setHighlightToTargets = (paths) => {
      for (const path of paths) {
        const elm = document.getElementById(path)
        elm.classList.add('selected')
      }
    }

    const setHighlightToOrigin = (path) => {
      document.getElementById(path)
        .classList.add('selected-origin')
    }

    const makeSelectDepLines = (pairs) => {
      this.clearDependencyLines('')
      this.makeDependencyLines(pairs, 'selected')
    }

    const makeSelectReadyDepLines = (pairs) => {
      this.makeDependencyLines(pairs, 'select-ready')
    }

    const clearSelectReadyDepLines = (pairs) => {
      this.clearDependencyLines('select-ready')
    }

    const setSelectReadyToTargets = (paths) => {
      for (const path of paths) {
        const elm = document.getElementById(path)
        elm.classList.add('select-ready')
      }
    }

    const setSelectReadyToOrigin = (path) => {
      document.getElementById(path)
        .classList.add('select-ready-origin')
    }

    const unsetSelectReadyToTargets = (paths) => {
      for (const path of paths) {
        const elm = document.getElementById(path)
        elm.classList.remove('select-ready')
      }
    }

    const unsetSelectReadyOfOrigin = (path) => {
      document.getElementById(path)
        .classList.remove('select-ready-origin')
    }

    const clickEventHandler = (d) => {
      this.clearHighlight()
      this.runParentsAndChildren(d,
        makeSelectDepLines,
        setHighlightToOrigin,
        setHighlightToTargets
      )
    }

    const mouseOverHandler = (d) => {
      // console.log(`mouseover: ${d.path}`)
      this.runParentsAndChildren(
        d,
        makeSelectReadyDepLines,
        setSelectReadyToOrigin,
        setSelectReadyToTargets
      )
    }

    const mouseOutHandler = (d) => {
      // console.log(`mouseout: ${d.path}`)
      this.runParentsAndChildren(
        d,
        clearSelectReadyDepLines,
        unsetSelectReadyOfOrigin,
        unsetSelectReadyToTargets
      )
    }

    this.allTargetObj
      .on('click', clickEventHandler)
      .on('mouseover', mouseOverHandler)
      .on('mouseout', mouseOutHandler)
  }

  setMouseEventToClearButton () {
    this.clearButton
      .on('click', () => {
        this.clearHighlight()
        this.clearDependencyLines('')
      })
  }

  setZoomEventToCanvas () {
    this.svg.call(zoom()
      .scaleExtent([1 / 4, 5])
      .on('zoom', () => this.svgGrp.attr('transform', event.transform))
    )
  }

  setOperationHandler (graphData) {
    this.graphData = graphData
    this.allTargetObj = this.svgGrp
      .selectAll('g.layer-objects')
      .selectAll('.dep')

    this.setMouseEventsToGraphObject()
    this.setMouseEventToClearButton()
    this.setZoomEventToCanvas()
  }

  findGraphObjByPath (path) {
    let foundObj
    for (const layer of this.graphData) {
      const foundNode = layer.nodes.find(d => d.path === path)
      const foundTp = layer.tps.find(d => d.path === path)
      foundObj = foundNode || foundTp
      if (foundObj) {
        break
      }
    }
    return foundObj
  }

  getParentsTree (objData) {
    const pathList = []
    for (const parentPath of objData.parents) {
      const parentObj = this.findGraphObjByPath(parentPath)
      if (parentObj) {
        pathList.push({ // push myself and parent
          'src': objData,
          'dst': parentObj
        })
        // push parent and parents of parent
        pathList.push(this.getParentsTree(parentObj))
      }
    }
    return this.flatten(pathList)
  }

  getChildrenTree (objData) {
    const pathList = []
    for (const childPath of objData.children) {
      const childObj = this.findGraphObjByPath(childPath)
      if (childObj) {
        pathList.push({ // push myself and child
          'src': objData,
          'dst': childObj
        })
        // push child and children of child
        pathList.push(this.getChildrenTree(childObj))
      }
    }
    return this.flatten(pathList)
  }
}
