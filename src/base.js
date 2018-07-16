'use strict'

export class BaseContainer {
  constructor () {
    this.name = ''
  }

  flatten (list) {
    // common class method
    // (to avoid monkey patch to Array.prototype)
    // https://qiita.com/shuhei/items/5a3d3a779b64a81b8c8d
    return Array.prototype.concat.apply([], list)
  }
}
