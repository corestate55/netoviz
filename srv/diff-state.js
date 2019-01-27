'use strict'

module.exports = class DiffState {
  constructor (data) {
    this.forward = 'kept'
    this.backward = 'kept'
    this.pair = {}
    if (data !== {}) {
      this.forward = data['forward'] || 'kept'
      this.backward = data['backward'] || 'kept'
      this.pair = data['pair'] || {}
    }
  }

  detect () {
    if (this.forward === 'added' || this.forward === 'deleted') {
      return this.forward
    } else if (this.forward === 'changed' || this.backward === 'changed') {
      return 'changed'
    } else {
      return 'kept'
    }
  }
}
