'use strict'
/**
 * @file Definition of base class of all topology model components.
 */
import DiffState from '../common/diff-state'
import BaseContainer from '../common/base'

/**
 * Base class of all topology model components.
 * @extends {BaseContainer}
 */
class TopoBaseContainer extends BaseContainer {
  /**
   * @param {Object} data - RFC topology data.
   */
  constructor(data) {
    super()
    this._constructDiffState(data)
  }

  /**
   * Construct diff-state.
   * @param {Object} data - RFC topology data.
   * @private
   */
  _constructDiffState(data) {
    const dsKey = '_diff_state_' // alias
    if (data && dsKey in data) {
      /** @type {DiffState} */
      this.diffState = new DiffState(data[dsKey])
    } else {
      /** @type {DiffState} */
      this.diffState = new DiffState({}) // empty diff state
    }
  }
}

export default TopoBaseContainer
