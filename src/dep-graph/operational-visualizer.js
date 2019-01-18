import { SingleDepGraphVisualizer } from './single-visualizer'

export class OperationalDepGraphVisualizer extends SingleDepGraphVisualizer {
  constructor () {
    super()
  }

  setOperationHandler (graphData) {
    this.graphData = graphData
    this.allTargetObj = this.svg
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
      const parentsTree = this.sortUniq(this.getParentsTree(selfObj))
      // console.log('parent tree :', parentsTree)
      const childrenTree = this.sortUniq(this.getChildrenTree(selfObj))
      // console.log('children tree :', childrenTree)

      for (const target of this.flatten([selfObj.path, parentsTree, childrenTree])) {
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
      this.svg.selectAll('.selected')
        .classed('selected', false)
    }
    this.clearButton
      .on('click', clearHighlight)
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
        // console.log(`curr: ${objData.path}, parent: ${parentObj.path}`)
        pathList.push(parentObj.path) // origin is not contained
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
        // console.log(`curr: ${objData.path}, child: ${childObj.path}`)
        pathList.push(childObj.path) // origin is not contained
        pathList.push(this.getChildrenTree(childObj))
      }
    }
    return this.flatten(pathList)
  }
}
