import { event } from 'd3-selection'
import L2LinkAttribute from '~/server/graph/topo-model/link-l2attr'
import L3LinkAttribute from '~/server/graph/topo-model/link-l3attr'
import L2NetworkAttribute from '~/server/graph/topo-model/network-l2attr'
import L3NetworkAttribute from '~/server/graph/topo-model/network-l3attr'
import L2NodeAttribute from '~/server/graph/topo-model/node-l2attr'
import L3NodeAttribute from '~/server/graph/topo-model/node-l3attr'
import L2TPAttribute from '~/server/graph/topo-model/term-point-l2attr'
import L3TPAttribute from '~/server/graph/topo-model/term-point-l3attr'
import AggregateNodeAttribute from '~/server/graph/topo-model/node-aggr-attr'

const AttrClassOf = {
  L2LinkAttribute,
  L3LinkAttribute,
  L2NetworkAttribute,
  L3NetworkAttribute,
  L2NodeAttribute,
  L3NodeAttribute,
  L2TPAttribute,
  L3TPAttribute,
  AggregateNodeAttribute
}

export default class TooltipCreator {
  constructor(origin) {
    this.makeTooltip(origin)
    this.disableTooltipTimeout = null
  }

  makeTooltip(origin) {
    this.tooltip = origin // d3-selection to insert tooltip
      .append('div')
      .classed('tooltip', true)
      .classed('pop-down', true)
  }

  _isAggregated(node) {
    return (
      node && // check each: `node` itself will be null/undefined
      node.attribute &&
      node.attribute.class === 'AggregateNodeAttribute'
    )
  }

  _enableTooltipForAggregatedNode(node, tooltipAnchorClickCallback) {
    const mouseEnter = () => {
      clearTimeout(this.disableTooltipTimeout)
    }
    const mouseLeave = () => {
      this._disableTooltipBody()
    }
    const toolTipAnchorClick = element => {
      const node = {
        name: element.getAttribute('data-name'),
        path: element.getAttribute('data-path')
      }
      tooltipAnchorClickCallback(node)
    }
    this.tooltip
      .classed('aggregated', true)
      .on('mouseenter', mouseEnter)
      .on('mouseleave', mouseLeave)
    this.tooltip.selectAll('a').on('click', function() {
      toolTipAnchorClick(this)
    })
  }

  // `tooltipAnchorClickCallback` is omissible argument,
  // it is used for aggregated-node tooltip. (click drill-down callback)
  enableTooltip(node, tooltipAnchorClickCallback) {
    // disable timer
    clearTimeout(this.disableTooltipTimeout)
    this._disableTooltipBody()
    // tooltip header
    let tooltipBody = node.path
    // tooltip body
    if (node && Object.keys(node.attribute).length > 0) {
      const AttrClass = AttrClassOf[node.attribute.class]
      const attr = new AttrClass(node.attribute)
      tooltipBody = tooltipBody + attr.toHtml()
    }
    // tooltip position
    this.tooltip
      .style('top', `${event.pageY - 70}px`)
      .style('left', `${event.pageX + 10}px`)
      .classed('pop-up', true)
      .classed('pop-down', false)
      .html(tooltipBody)

    // for aggregated node
    if (this._isAggregated(node)) {
      this._enableTooltipForAggregatedNode(node, tooltipAnchorClickCallback)
    }
  }

  _disableTooltipBody() {
    this.tooltip
      .classed('pop-up', false)
      .classed('pop-down', true)
      .classed('aggregated', false)
  }

  // `node` is omissible argument.
  // specify `node` (aggregated node) data to set delay to disable tooltip.
  disableTooltip(node) {
    if (this._isAggregated(node)) {
      const timeoutCallback = () => this._disableTooltipBody()
      this.disableTooltipTimeout = setTimeout(timeoutCallback, 1500)
    } else {
      this._disableTooltipBody()
    }
  }
}
