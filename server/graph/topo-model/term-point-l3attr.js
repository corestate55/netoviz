'use strict'

import TopoBaseContainer from './topo-base'

export default class L3TPAttribute extends TopoBaseContainer {
  constructor(data) {
    super(data)
    this.class = 'L3TPAttribute'
    // TODO: choice ip/unnumbered/interface-name,
    // but, now use only ip
    this.ipAddress = data['ip-address'] || data.ipAddress || [] // notice: array
  }

  toHtml() {
    return `
<ul>
 <li><span class="attr">IP Address:</span> ${this.ipAddress}</li>
</ul>
`
  }
}
