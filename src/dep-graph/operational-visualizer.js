import { zoom } from 'd3-zoom'
import { event } from 'd3-selection'
import SingleDepGraphVisualizer from './single-visualizer'

export default class OperationalDepGraphVisualizer extends SingleDepGraphVisualizer {
  clearHighlight () {
    if (!this.svgGrp) {
      return // return if not ready svg (initial)
    }
    this.svgGrp.selectAll('.selected')
      .classed('selected', false)
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

  runParentsAndChildren (selfObj, actionForPairs, actionForTargets) {
    const parentPairs = this.getParentsTree(selfObj)
    const parentPaths = this.pathsFromPairs(selfObj, parentPairs)
    const childPairs = this.getChildrenTree(selfObj)
    const childPaths = this.pathsFromPairs(selfObj, childPairs)

    // action for each pairs(line: src/dst)
    actionForPairs(parentPairs.concat(childPairs))
    // action for each parent/child
    actionForTargets(this.flatten([selfObj.path, parentPaths, childPaths]))
  }

  clickEventHandler (d) {
    // console.log('click event: ', d)
    const makeSelectDepLines = (pairs) => {
      this.clearDependencyLines('')
      this.makeDependencyLines(pairs, 'selected')
    }
    const setHighlightByPath = (paths) => {
      this.clearHighlight()
      for (const path of paths) {
        const elm = document.getElementById(path)
        elm.classList.add('selected')
      }
    }
    this.runParentsAndChildren(d,
      makeSelectDepLines, setHighlightByPath)
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
    const makeSelectReadyDepLines = (pairs) => {
      this.makeDependencyLines(pairs, 'select-ready')
    }
    const setSelectReadyByPath = (paths) => {
      for (const path of paths) {
        this.selectReadyByPath(path, true)
      }
    }
    this.runParentsAndChildren(d,
      makeSelectReadyDepLines, setSelectReadyByPath)
  }

  mouseOutHandler (d) {
    // console.log(`mouseout: ${d.path}`)
    const clearSelectReadyDepLines = (pairs) => {
      this.clearDependencyLines('select-ready')
    }
    const unsetSelectReadyByPath = (paths) => {
      for (const path of paths) {
        this.selectReadyByPath(path, false)
      }
    }
    this.runParentsAndChildren(d,
      clearSelectReadyDepLines, unsetSelectReadyByPath)
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

    this.clearButton
      .on('click', () => {
        this.clearHighlight()
        this.clearDependencyLines('')
      })

    this.svg.call(zoom()
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
          'dst': objData,
          'src': childObj
        })
        // push child and children of child
        pathList.push(this.getChildrenTree(childObj))
      }
    }
    return this.flatten(pathList)
  }
}
