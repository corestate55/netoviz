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
  apiURI(graphName, jsonName, params) {
    // keep to use in click-hook
    /** @type {string } */
    this.jsonName = jsonName
    /** @type {Object} */
    this.uriParams = params
    return super.apiURI(graphName, jsonName, params)
  }

  /**
   * Get API dictionary.
   * @param {AlertRow} alert - Selected alert.
   * @param {boolean} reverse - Flag for top/bottom view selection.
   * @param {number} depth - Maximum layer depth to display.
   * @param {string} [layer] - Layer name of selected node to highlight.
   * @param {boolean} [aggregate] - Enable node aggregation.
   * @returns {Object} Parameter dictionary.
   * @private
   */
  _apiParamFrom(alert, reverse, depth, layer, aggregate) {
    return {
      target: this.targetNameFromAlert(alert),
      reverse,
      depth,
      layer,
      aggregate
    }
  }

  /**
   * Draw topology json data as SVG diagram.
   * @param {string} jsonName - Name of topology file.
   * @param {AlertRow} alert - Selected alert.
   * @param {boolean} reverse - Flag for top/bottom view selection.
   * @param {number} depth - Maximum layer depth to display.
   * @param {string} [layer] - Layer name of selected node to highlight.
   *     (used-in click-hook, to drill-down by click)
   * @param {boolean} [fitGrid] - Flag for enable/disable grid-fitting.
   * @param {boolean} [aggregate] - Flag for enable/disable node aggregation.
   * @public
   */
  drawRfcTopologyData(
    jsonName,
    alert,
    reverse,
    depth,
    layer,
    fitGrid,
    aggregate
  ) {
    const param = this._apiParamFrom(alert, reverse, depth, layer, aggregate)
    json(this.apiURI('nested', jsonName, param))
      .then(
        topologyData => {
          this.clearDiagramContainer()
          this.makeGraphObjects(topologyData)
          this.setAllDiagramElementsHandler(topologyData)
          this.highlightByAlert(alert)
        },
        error => {
          throw error
        }
      )
      .then(() => fitGrid && this.fitGrid())
  }

  /**
   * Save layout data.
   * @param {string} jsonName - Name of topology file.
   * @param {boolean} reverse - Flag for top/bottom view selection.
   * @param {number} depth - Maximum layer depth to display
   * @public
   */
  saveLayout(jsonName, reverse, depth) {
    const param = this._apiParamFrom({ host: '' }, reverse, depth)
    const layoutData = {
      x: this.xGrids.map(d => d.position),
      y: this.yGrids.map(d => d.position)
    }
    json(this.apiURI('nested', jsonName, param), {
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
      this.drawRfcTopologyData(
        this.jsonName,
        { host: d.name },
        this.uriParams.reverse,
        this.uriParams.depth,
        this.networkPathOf(d.path)
      )
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
   * Highlight node with selected host in alert-table.
   * @param {AlertRow} alert - Selected alert.
   * @public
   */
  highlightByAlert(alert) {
    // this.topologyData = json data
    // assign at this.setAllDiagramElementsHandler()
    if (!alert || !this.topologyData) {
      return
    }
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
