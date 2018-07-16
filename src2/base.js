'use strict'

export class BaseContainer {
  constructor (data) {
    this.id = 0
    this.name = ''
    this.path = ''
  }

  flatten (list) {
    // common class method
    // (to avoid monkey patch to Array.prototype)
    // https://qiita.com/shuhei/items/5a3d3a779b64a81b8c8d
    return Array.prototype.concat.apply([], list)
  }
}
