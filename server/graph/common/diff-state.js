'use strict'
/**
 * @file Definition of diff-state.
 */

/**
 * Diff state of network diagram coponents.
 */
class DiffState {
  /**
   * @typedef {Object} DiffStateData
   * @prop {string} forward - Forward diff status.
   * @prop {string} backward - Backward diff status.
   * @prop {string} pair - Path of diff-counterpart.
   */
  /**
   * @param {DiffStateData|{}} data - Data of diff state.
   */
  constructor(data) {
    /** @type {string} */
    this.forward = 'kept'
    /** @type {string} */
    this.backward = 'kept'
    this.pair = {}
    if (data !== {}) {
      /** @type {string} */
      this.forward = data.forward || 'kept'
      /** @type {string} */
      this.backward = data.backward || 'kept'
      /** @type {string|Object|{}} */
      this.pair = data.pair || {}
    }
  }

  /**
   * Detect diff state.
   * @returns {string} Diff state.
   * @public
   */
  detect() {
    if (this.forward === 'added' || this.forward === 'deleted') {
      return this.forward
    } else if (this.forward === 'changed' || this.backward === 'changed') {
      return 'changed'
    }
    return 'kept'
  }
}

export default DiffState
