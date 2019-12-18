import { event } from 'd3-selection'
import L2LinkAttribute from '~/server/graph/topo-model/link-l2attr'
import L3LinkAttribute from '~/server/graph/topo-model/link-l3attr'
import L2NetworkAttribute from '~/server/graph/topo-model/network-l2attr'
import L3NetworkAttribute from '~/server/graph/topo-model/network-l3attr'
import L2NodeAttribute from '~/server/graph/topo-model/node-l2attr'
import L3NodeAttribute from '~/server/graph/topo-model/node-l3attr'
import L2TPAttribute from '~/server/graph/topo-model/term-point-l2attr'
import L3TPAttribute from '~/server/graph/topo-model/term-point-l3attr'

const AttrClassOf = {
  L2LinkAttribute,
  L3LinkAttribute,
  L2NetworkAttribute,
  L3NetworkAttribute,
  L2NodeAttribute,
  L3NodeAttribute,
  L2TPAttribute,
  L3TPAttribute
}

export default class TooltipCreator {
  constructor(origin) {
    this.makeToolTip(origin)
  }

  makeToolTip(origin) {
    this.tooltip = origin // d3-selection to insert tooltip
      .append('div')
      .classed('tooltip', true)
      .classed('pop-down', true)
  }

  enableTooltip(node) {
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
      .style('left', `${event.pageX + 30}px`)
    this.tooltip
      .classed('pop-up', true)
      .classed('pop-down', false)
      .html(tooltipBody)
  }

  disableTooltip() {
    this.tooltip.classed('pop-up', false).classed('pop-down', true)
  }
}
