'use strict'

import {DiffState} from './diff-state'

export class BaseContainer {
  constructor () {
  }

  flatten (list) {
    // common class method
    // (to avoid monkey patch to Array.prototype)
    // https://qiita.com/shuhei/items/5a3d3a779b64a81b8c8d
    return Array.prototype.concat.apply([], list)
  }
}

export class TopoBaseContainer extends BaseContainer {
  constructor (data) {
    super()
    this.constructDiffState(data)
  }

  constructDiffState (data) {
    const dsKey = '_diff_state_' // alias
    if (dsKey in data) {
      this.diffState = new DiffState(data[dsKey])
    } else {
      this.diffState = new DiffState({}) // empty diff state
    }
  }
}
