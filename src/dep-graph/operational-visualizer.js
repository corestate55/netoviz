import { zoom } from 'd3-zoom'
import { event } from 'd3-selection'
import { SingleDepGraphVisualizer } from './single-visualizer'

export class OperationalDepGraphVisualizer extends SingleDepGraphVisualizer {
  constructor () {
    super()
  }

  clearDependencyLines () {
    this.depLineGrp.selectAll('line').remove()
  }

  makeDependencyLines (lines) {
    for (const line of lines) {
      if (line.src.type !== line.dst.type) {
        continue
      }
      if (line.src.type === 'tp') {
        this.depLineGrp.append('line')
          .attr('class', 'dep tp')
          .attr('x1', line.src.cx)
          .attr('y1', line.src.cy)
          .attr('x2', line.dst.cx)
          .attr('y2', line.dst.cy)
          .attr('marker-end', 'url(#tp-dep-arrow-end)')
      }
      if (line.src.type === 'node') {
        this.depLineGrp.append('line')
          .attr('class', 'dep node')
          .attr('x1', line.src.x + line.src.width / 2)
          .attr('y1', line.src.y < line.dst.y ? line.src.y + line.src.height : line.src.y)
          .attr('x2', line.dst.x + line.dst.width / 2)
          .attr('y2', line.src.y < line.dst.y ? line.dst.y : line.dst.y + line.dst.height)
          .attr('marker-end', 'url(#node-dep-arrow-end)')
      }
    }
  }

  setOperationHandler (graphData) {
    this.graphData = graphData
    this.allTargetObj = this.svgGrp
      .selectAll('g.layer-objects')
      .selectAll('.dep')

    const toggleHighlightByPath = (path) => {
      const elm = document.getElementById(path)
      // console.log('highlight : ', elm)
      if (elm.classList.contains('selected')) {
        elm.classList.remove('selected')
      } else {
        elm.classList.add('selected')
      }
    }

    const runParentsAndChildren = (selfObj, action) => {
      // without sort-uniq,
      // parents/children tree contains duplicated element.
      // when toggle odd times the element, highlight was disabled.
      const parentPairs = this.getParentsTree(selfObj)
      const parentPaths = this.sortUniq(
        this.flatten([selfObj.path, parentPairs.map(d => d.dst.path)])
      )
      // console.log('parent pairs:', parentPairs)
      // console.log('parent paths:', parentPaths)
      this.makeDependencyLines(parentPairs)

      const childPairs = this.getChildrenTree(selfObj)
      const childPaths = this.sortUniq(
        this.flatten([selfObj.path, childPairs.map(d => d.dst.path)])
      )
      // console.log('child pairs:', childPairs)
      // console.log('child paths:', childPaths)
      this.makeDependencyLines(childPairs)

      // action for each parent/child
      for (const target of this.flatten([selfObj.path, parentPaths, childPaths])) {
        action(target)
      }
    }

    const clickEventHandler = (d) => {
      // console.log(`click: ${d.path}`)
      runParentsAndChildren(d, toggleHighlightByPath)
    }

    const selectReadyByPath = (path, turnOn) => {
      const elm = document.getElementById(path)
      if (turnOn) {
        elm.classList.add('select-ready')
      } else {
        elm.classList.remove('select-ready')
      }
    }

    const setSelectReadyByPath = (path) => {
      selectReadyByPath(path, true)
    }

    const unsetSelectReadyByPath = (path) => {
      selectReadyByPath(path, false)
    }

    const mouseOverHandler = (d) => {
      // console.log(`mouseover: ${d.path}`)
      runParentsAndChildren(d, setSelectReadyByPath)
    }

    const mouseOutHandler = (d) => {
      // console.log(`mouseout: ${d.path}`)
      runParentsAndChildren(d, unsetSelectReadyByPath)
    }

    this.allTargetObj
      .on('click', clickEventHandler)
      .on('mouseover', mouseOverHandler)
      .on('mouseout', mouseOutHandler)

    const clearHighlight = () => {
      this.svgGrp.selectAll('.selected')
        .classed('selected', false)
      this.clearDependencyLines()
    }

    this.clearButton
      .on('click', clearHighlight)

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
