import { select } from 'd3-selection'

export default function drawLegend () {
  const styles = [
    { 'class': 'normal', 'label': 'normal' },
    { 'class': 'fixed', 'label': 'fixed' },
    { 'class': 'select-ready', 'label': 'ready' },
    { 'class': 'selected', 'label': 'selected' },
    { 'class': 'selected-children', 'label': 'child' },
    { 'class': 'selected-parents', 'label': 'parent' }
  ]
  const objSize = 20
  const xdp = 40
  const ydp = 5
  const legend = select('div#legend')
    .append('svg')
    .attr('width', xdp + (xdp + objSize) * styles.length)
    .attr('height', objSize * 2 + ydp * 5)
  const nodeY = ydp + objSize / 2

  const nodeCircleX = (d, i) => {
    return xdp + objSize / 2 + (xdp + objSize) * i
  }

  legend.selectAll('circle.node-circle')
    .data(styles)
    .enter()
    .append('circle')
    .attr('r', objSize / 2)
    .attr('cx', nodeCircleX)
    .attr('cy', nodeY)
    .attr('class', d => ['node-circle', d.class].join(' '))
  legend.selectAll('circle.node')
    .data(styles)
    .enter()
    .append('circle')
    .attr('r', 0.7 * objSize / 2)
    .attr('cx', nodeCircleX)
    .attr('cy', nodeY)
    .attr('class', d => ['node', d.class].join(' '))

  const tpY = nodeY + objSize / 2 + ydp + objSize / 4
  legend.selectAll('circle.tp')
    .data(styles)
    .enter()
    .append('circle')
    .attr('r', objSize / 4)
    .attr('cx', nodeCircleX)
    .attr('cy', tpY)
    .attr('class', d => ['tp', d.class].join(' '))

  const textY = tpY + objSize / 4 + ydp * 2
  legend.selectAll('text')
    .data(styles)
    .enter()
    .append('text')
    .attr('x', (d, i) => nodeCircleX(d, i))
    .attr('y', textY)
    .attr('text-anchor', 'middle')
    .text(d => d.label)
}
