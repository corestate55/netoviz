'use strict'

import DiffState from '../diff-state'
import BaseContainer from '../base'

export default class TopoBaseContainer extends BaseContainer {
  constructor (data) {
    super()
    this.constructDiffState(data)
  }

  constructDiffState (data) {
    const dsKey = '_diff_state_' // alias
    if (data && dsKey in data) {
      this.diffState = new DiffState(data[dsKey])
    } else {
      this.diffState = new DiffState({}) // empty diff state
    }
  }
}
