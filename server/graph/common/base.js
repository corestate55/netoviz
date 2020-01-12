'use strict'
/**
 * @file Definition of base class of graph component.
 */

/**
 * Base of graph component.
 */
class BaseContainer {
  /**
   * Array utility: sort and uniq.
   * @param {Array} list - Items.
   * @returns {Array} Sorted unique items.
   */
  sortUniq(list) {
    return Array.from(new Set(list)).sort()
  }

  /**
   * Array utility: flatten
   * @param {Array<Array>} list - Items.
   * @returns {Array} Flatten items.
   */
  flatten(list) {
    // common class method
    // (to avoid monkey patch to Array.prototype)
    // https://qiita.com/shuhei/items/5a3d3a779b64a81b8c8d
    return Array.prototype.concat.apply([], list)
  }
}

export default BaseContainer
