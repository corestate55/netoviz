import { event } from 'd3-selection'
import { linkVertical } from 'd3-shape'
import { zoom } from 'd3-zoom'
import SingleDepGraphVisualizer from './single-visualizer'

export default class OperationalDepGraphVisualizer extends SingleDepGraphVisualizer {
  clearHighlight () {
    if (!this.svgGrp) {
      return // return if not ready svg (initial)
    }
    this.svgGrp.selectAll('.selected').classed('selected', false)
  }

  clearDependencyLines (lineClass) {
    const selector = lineClass ? `path.${lineClass}` : 'path'
    this.depLineGrp.selectAll(selector).remove()
  }

  clearAllHighlight () {
    this.clearHighlight()
    this.clearDependencyLines('')
  }

  _lineConverter (line) {
    if (line.src.type === 'tp') {
      return {
        source: [line.src.cx, line.src.cy],
        target: [line.dst.cx, line.dst.cy],
        type: 'tp'
      }
    }
    // else line.src.type === 'node'
    const srcNodeY = line => {
      return line.src.y < line.dst.y ? line.src.y + line.src.height : line.src.y
    }
    const dstNodeY = line => {
      return line.src.y < line.dst.y ? line.dst.y : line.dst.y + line.dst.height
    }
    return {
      source: [line.src.x + line.src.width / 2, srcNodeY(line)],
      target: [line.dst.x + line.dst.width / 2, dstNodeY(line)],
      type: 'node'
    }
  }

  makeDependencyLines (lines, lineClass) {
    const lineGenerator = linkVertical()
      .x(d => this.scale(d[0]))
      .y(d => this.scale(d[1]))
    this.depLineGrp
      .selectAll(`path.${lineClass}`)
      .data(
        lines
          .filter(line => line.src.type === line.dst.type)
          .map(line => this._lineConverter(line))
      )
      .enter()
      .append('path')
      .attr('class', d => `dep ${d.type} ${lineClass}`)
      .attr('d', lineGenerator)
      .attr('stroke-width', this.scale(5))
  }

  pathsFromPairs (selfObj, pairs) {
    // without sort-uniq,
    // parents/children tree contains duplicated element.
    // when toggle odd times the element, highlight was disabled.
    return this.sortUniq(
      this.flatten([
        selfObj.path,
        pairs.map(d => d.src.path),
        pairs.map(d => d.dst.path)
      ])
    )
  }

  runParentsAndChildren (selfObj, actionForDepLine, actionForNodes) {
    const parentPairs = this.getParentsTree(selfObj)
    const parentPaths = this.pathsFromPairs(selfObj, parentPairs)
    const childPairs = this.getChildrenTree(selfObj)
    const childPaths = this.pathsFromPairs(selfObj, childPairs)

    // action for each pairs(line: src/dst)
    actionForDepLine(parentPairs.concat(childPairs))
    // action for each parent/child
    actionForNodes(this.flatten([selfObj.path, parentPaths, childPaths]))
  }

  clickEventHandler (d) {
    // console.log('click event: ', d)
    const makeSelectDepLines = pairs => {
      this.clearDependencyLines('')
      this.makeDependencyLines(pairs, 'selected')
    }
    const setHighlightByPath = paths => {
      this.clearHighlight()
      for (const path of paths) {
        const elm = document.getElementById(path)
        elm.classList.add('selected')
      }
    }
    this.runParentsAndChildren(d, makeSelectDepLines, setHighlightByPath)
  }

  selectReadyByPath (path, turnOn) {
    const elm = document.getElementById(path)
    if (turnOn) {
      elm.classList.add('select-ready')
    } else {
      elm.classList.remove('select-ready')
    }
  }

  mouseOverHandler (d) {
    // console.log(`mouseover: ${d.path}`)
    const makeSelectReadyDepLines = pairs => {
      this.makeDependencyLines(pairs, 'select-ready')
    }
    const setSelectReadyByPath = paths => {
      for (const path of paths) {
        this.selectReadyByPath(path, true)
      }
    }
    this.runParentsAndChildren(d, makeSelectReadyDepLines, setSelectReadyByPath)
    this.tooltip.enableTooltip(d)
  }

  mouseOutHandler (d) {
    // console.log(`mouseout: ${d.path}`)
    const clearSelectReadyDepLines = pairs => {
      this.clearDependencyLines('select-ready')
    }
    const unsetSelectReadyByPath = paths => {
      for (const path of paths) {
        this.selectReadyByPath(path, false)
      }
    }
    this.runParentsAndChildren(
      d,
      clearSelectReadyDepLines,
      unsetSelectReadyByPath
    )
    this.tooltip.disableTooltip(d)
  }

  setOperationHandler (graphData) {
    this.graphData = graphData
    this.allTargetObj = this.svgGrp
      .selectAll('g.layer-objects')
      .selectAll('.dep')

    const self = this
    this.allTargetObj
      .on('click', d => self.clickEventHandler(d))
      .on('mouseover', d => self.mouseOverHandler(d))
      .on('mouseout', d => self.mouseOutHandler(d))

    this.setGraphControlButtons(() => {
      this.clearHighlight()
      this.clearDependencyLines('')
    })

    this.svg.call(
      zoom()
        .scaleExtent([1 / 4, 5])
        .on('zoom', () => this.svgGrp.attr('transform', event.transform))
    )
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
        pathList.push({
          // push myself and parent
          src: objData,
          dst: parentObj
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
        pathList.push({
          // push myself and child
          dst: objData,
          src: childObj
        })
        // push child and children of child
        pathList.push(this.getChildrenTree(childObj))
      }
    }
    return this.flatten(pathList)
  }
}
