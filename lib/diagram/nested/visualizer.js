/**
 * @file Definition of class to control nested network diagram.
 */

import { json } from 'd3-fetch'
import NestedDiagramOperator from './operator'

/**
 * Network diagram controller.
 * @extends {NestedDiagramOperator}
 */
class NestedDiagramVisualizer extends NestedDiagramOperator {
  /**
   * @override
   */
  afterDrawRfcTopologyDataHook(params) {
    // keep params for drawRfcTopologyData to use it in click-callback.
    this.drawParam = params
    this.drawParam?.fitGrid && this.fitGrid()
  }

  /**
   * Save layout data.
   * @param {TopologyDiagramParam} params
   * @public
   */
  saveLayout(params) {
    const layoutData = {
      x: this.xGrids.map(d => d.position),
      y: this.yGrids.map(d => d.position)
    }
    json(this.restURI('nested', params), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(layoutData)
    }).then(response => console.log(response.message))
  }

  /**
   * Set callback from Frontend(UI) for node click (drill-down).
   * @param {NestedDiagramVisualizer-uiSideNodeClickCallback} callback - Click callback.
   * @public
   */
  setUISideNodeClickHook(callback) {
    /**
     * @callback NestedDiagramVisualizer-uiSideNodeClickCallback
     * @param {NestedNodeData} nodeData - Clicked node data.
     */
    /**
     * @type {NestedDiagramVisualizer-uiSideNodeClickCallback}
     */
    this.uiSideNodeClickCallback = callback
  }

  /**
   * @override
   */
  nodeClickHook(d) {
    if (typeof this.uiSideNodeClickCallback === 'function') {
      // if this callback exist, redraw event will be arise from UI-side.
      this.uiSideNodeClickCallback(d)
    } else {
      const params = {
        ...this.drawParam,
        alertHost: d.path
      }
      this.drawRfcTopologyData(params)
    }
  }

  /**
   * Find operative parents and highlight it.
   * @param {Array<NestedNodeData>} alertNodes - Nodes to highlight.
   * @private
   */
  _FindOperativeParentAndHighlight(alertNodes) {
    // search only nodes (ignore tp)
    for (const alertNode of alertNodes.filter(node => node.type === 'node')) {
      const parentsFromInoperative = []
      // parents/children of inoperative node are not processed
      // it is constant whether reverse is true or not.
      for (const parentPath of alertNode.parents) {
        const operativeParent = this.findOperativeNodeByPath(parentPath)
        if (operativeParent) {
          this.highlight(operativeParent, 'selected-parents')
        } else {
          const inoperativeParent = this.findInoperativeNodeByPath(parentPath)
          parentsFromInoperative.push(inoperativeParent)
        }
      }
      this._FindOperativeParentAndHighlight(parentsFromInoperative)
    }
  }

  /**
   * Highlight operative-parent of (inoperative) highlight target.
   * (Indirect alert highlight)
   * @param {AlertRow} alert - Selected alert.
   * @private
   */
  _highlightParentOfInoperativeNodes(alert) {
    const message = `Alerted host: [${alert.host}] is not found.`
    this.makeWarningMessage(message)
    const alertNodes = this.inoperativeNodesByName(alert.host)
    this._FindOperativeParentAndHighlight(alertNodes)
  }

  /**
   * Highlight found operative nodes.
   * (Direct alert highlight)
   * @param {Array<NestedNodeData>} alertNodes - Operative nodes to highlight.
   * @private
   */
  _highlightOperativeNodes(alertNodes) {
    for (const alertNode of alertNodes) {
      this.highlight(alertNode, 'selected')
    }
  }

  /**
   * @override
   */
  highlightByAlert(alertHost) {
    // this.topologyData = json data
    // assign at this.setAllDiagramElementsHandler()
    if (!alertHost || !this.topologyData) {
      return
    }
    const alert = this.splitAlertHost(alertHost)

    this.clearWarningMessage()
    // target is tp:
    //   when highlight tp, alert always contains layer/host/tp.
    //   (need to use full-path of tp)
    if (alert.tp) {
      const path = [alert.layer, alert.host, alert.tp].join('__')
      const node = this.findOperativeNodeByPath(path)
      node && this.highlight(node, 'selected')
    }
    // target is host (OR host of target tp)
    const alertNodes = this.operativeNodesByName(alert.host)
    if (alertNodes.length > 0) {
      this._highlightOperativeNodes(alertNodes)
    } else {
      this._highlightParentOfInoperativeNodes(alert)
    }
  }
}

export default NestedDiagramVisualizer
