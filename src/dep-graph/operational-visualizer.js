import { SingleDepGraphVisualizer } from './single-visualizer'

export class OperationalDepGraphVisualizer extends SingleDepGraphVisualizer {
  constructor () {
    super()
  }

  setOperationHandler (graphData) {
    this.graphData = graphData

    const clickEventHandler = (d) => {
      console.log(`click: ${d.path}`)
      const parentsTree = this.getParentsTree(d)
      console.log('parent tree :', parentsTree)
      const childrenTree = this.getChildrenTree(d)
      console.log('children tree :', childrenTree)
    }

    this.svg
      .selectAll('g.layer-objects')
      .selectAll('.dep')
      .on('click', clickEventHandler)
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
        pathList.push(parentObj.path)
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
        pathList.push(childObj.path)
        pathList.push(this.getChildrenTree(childObj))
      }
    }
    return this.flatten(pathList)
  }
}
