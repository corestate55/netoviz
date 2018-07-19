'use strict'

import {TermPoint} from './term-points'

class L3TPAttribute {
  constructor (data) {
    // TODO: choice ip/unnumbered/interface-name,
    // but, now use only ip
    this.ipAddress = data['ip-address'] || [] // notice: array
  }

  toHtml () {
    return `
<ul>
 <li>IP Address: ${this.ipAddress}</li>
</ul>
`
  }
}

export class L3TermPoint extends TermPoint {
  constructor (data, nodePath, nodeId, tpNum) {
    super(data, nodePath, nodeId, tpNum)
    let attrKey = 'ietf-l3-unicast-topology:l3-termination-point-attributes' // alias
    this.attribute = new L3TPAttribute(data[attrKey] || {}) // avoid undefined
  }
}
