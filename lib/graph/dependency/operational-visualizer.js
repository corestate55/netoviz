import { event } from 'd3-selection'
import { linkVertical } from 'd3-shape'
import { zoom } from 'd3-zoom'
import SingleDepGraphVisualizer from './single-visualizer'

export default class OperationalDepGraphVisualizer extends SingleDepGraphVisualizer {
  clearHighlight() {
    if (!this.svgGrp) {
      return // return if not ready svg (initial)
    }
    this.svgGrp.selectAll('.selected').classed('selected', false)
  }

  clearDependencyLines(lineClass) {
    const selector = lineClass ? `path.${lineClass}` : 'path'
    this.depLineGrp.selectAll(selector).remove()
  }

  clearAllHighlight() {
    this.clearHighlight()
    this.clearDependencyLines('')
  }

  _lineConverter(line) {
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

  makeDependencyLines(lines, lineClass) {
    const lineGenerator = linkVertical()
      .x(d => d[0])
      .y(d => d[1])
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
      .attr('stroke-width', 5)
  }

  pathsFromPairs(selfObj, pairs) {
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

  runParentsAndChildren(selfObj, actionForDepLine, actionForNodes) {
    const parentPairs = this.getFamilyTree(selfObj, 'parents')
    const parentPaths = this.pathsFromPairs(selfObj, parentPairs)
    const childPairs = this.getFamilyTree(selfObj, 'children')
    const childPaths = this.pathsFromPairs(selfObj, childPairs)

    // action for each pairs(line: src/dst)
    actionForDepLine(parentPairs.concat(childPairs))
    // action for each parent/child
    actionForNodes(this.flatten([selfObj.path, parentPaths, childPaths]))
  }

  markTargetByPaths(paths, markClass) {
    paths.forEach(path => {
      this.svgGrp.select(`[id='${path}']`).classed(...markClass)
    })
  }

  clickEventHandler(d) {
    // console.log('click event: ', d)
    const makeSelectDepLines = pairs => {
      this.clearDependencyLines('')
      this.makeDependencyLines(pairs, 'selected')
    }
    const setHighlightByPath = paths => {
      this.clearHighlight()
      this.markTargetByPaths(paths, ['selected', true])
    }
    this.runParentsAndChildren(d, makeSelectDepLines, setHighlightByPath)
  }

  selectReadyByPath(path, turnOn) {
    this.markTargetByPaths([path], ['select-ready', turnOn])
  }

  mouseOverHandler(d) {
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

  mouseOutHandler(d) {
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

  setInitialZoom() {
    const lastNodes = this.graphData
      .map(layer => layer.nodes[layer.nodes.length - 1])
      .filter(n => n) // ignore empty nodes case
    const maxX = Math.max(...lastNodes.map(n => n.x + n.width))
    const maxY = Math.max(
      ...lastNodes.map(n => n.y + n.height + this.fontSize * 2)
    )
    const zoomRatio = Math.min(this.width / maxX, this.height / maxY)
    this.zoom.scaleTo(this.svg, zoomRatio)
    this.zoom.translateTo(this.svg, 0, 0, [0, 0])
  }

  setOperationHandler(graphData) {
    this.graphData = graphData
    this.allTargetObj = this.svgGrp
      .selectAll('g.layer-objects')
      .selectAll('.dep')

    this.allTargetObj
      .on('click', d => this.clickEventHandler(d))
      .on('mouseover', d => this.mouseOverHandler(d))
      .on('mouseout', d => this.mouseOutHandler(d))

    this.setGraphControlButtons(() => {
      this.clearHighlight()
      this.clearDependencyLines('')
    })

    this.zoom = zoom()
      .scaleExtent([1 / 4, 5])
      .on('zoom', () => this.svgGrp.attr('transform', event.transform))
    this.svg.call(this.zoom)
    this.setInitialZoom()
  }

  findGraphObjByPath(path) {
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

  getFamilyTree(objData, relation) {
    const pathList = []
    for (const familyPath of objData[relation]) {
      const familyObj = this.findGraphObjByPath(familyPath)
      if (!familyObj) {
        continue
      }
      // push myself and family
      pathList.push({ src: objData, dst: familyObj })
      // push families of family
      pathList.push(this.getFamilyTree(familyObj, relation))
    }
    return this.flatten(pathList)
  }
}
