'use strict'

const TopoBaseContainer = require('./topo-base')

module.exports = class L2NodeAttribute extends TopoBaseContainer {
  constructor (data) {
    super(data)
    this.class = 'L2NodeAttribute'
    this.name = data.name || ''
    this.description = data.description || ''
    this.mgmtAddr = data['management-address'] || data.mgmtAddr || [] // ip addr list
    this.sysMacAddr = data['sys-mac-address'] || data.sysMacAddr || 'zz:zz:zz:zz:zz:zz'
    this.mgmtVid = data['management-vid'] || data.mgmtVid || 1
    this.flag = data.flag || [] // list
  }

  toHtml () {
    const mgmtIpStr = this.mgmtAddr.map(d => `<li>${d}</li>`)
    return `
<ul>
  <li><span class="attr">Name:</span> ${this.name}</li>
  <li><span class="attr">Description:</span> ${this.description}</li>
  <li><span class="attr">Management IP:</span></li>
    <ul>${mgmtIpStr.join('')}</ul>
  <li><span class="attr">Management VID:</span> ${this.mgmtVid}</li>
  <li><span class="attr">Flag:</span> ${this.flag}</li>
`
  }
}
