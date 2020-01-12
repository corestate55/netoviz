'use strict'
/**
 * Definition of diff-state.
 */

/**
 * Diff state of network diagram coponents.
 */
class DiffState {
  /**
   * @param {Object} data - Data of diff state.
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
      /** @type {Object|{}} */
      this.pair = data.pair || {}
    }
  }

  /**
   * Detect diff state.
   * @returns {string} Diff state.
   */
  detect() {
    if (this.forward === 'added' || this.forward === 'deleted') {
      return this.forward
    } else if (this.forward === 'changed' || this.backward === 'changed') {
      return 'changed'
    } else {
      return 'kept'
    }
  }
}

export default DiffState
