/**
 * @file Definition of class to visualize dependency-2 network diagram.
 */

import Dependency2DiagramOperator from './operator'

/**
 * Dependency-2 network diagram visualizer.
 * @extends {Dependency2DiagramOperator}
 */
class Dependency2DiagramVisualizer extends Dependency2DiagramOperator {
  /**
   * Find diagram-element by node.
   * @param {string} name - Name of element.
   * @returns {Dependency2NodeData} Found element.
   * @private
   */
  _findNodeObjByName(name) {
    // reverse to find low layer at first.
    // use spread copy to avoid destructive reverse.
    return [...this.allNodeDataList()]
      .reverse()
      .find(d => d.type === 'node' && d.name === name)
  }

  /**
   * @override
   */
  highlightByAlert(alert) {
    if (!alert || !this.rootSVGSelection) {
      return
    }
    const result = this._findNodeObjByName(alert.host)
    if (result) {
      this.clearWarningMessage()
      this.clickHandler(result)
    } else {
      const message = `Alerted host: [${alert.host}] is not found.`
      this.clearAllHighlight()
      this.makeWarningMessage(message)
    }
  }
}

export default Dependency2DiagramVisualizer
