/**
 * @file Definition of Link creator for nested graph visualizer.
 */

import InterTpLink from './inter-tp-link'

/**
 * Inter term-point link creator.
 */
class InterTpLinkCreator {
  /**
   * @param {NestedTopologyData} graphData - Graph data of nested graph.
   */
  constructor(graphData) {
    const findNodeByPath = (nodes, path) => {
      return nodes.find(tp => tp.path === path)
    }
    /** @type {Array<InterTpLink>} */
    this.links = graphData.links.map(link => {
      const sourceTp = findNodeByPath(graphData.nodes, link.sourcePath)
      const targetTp = findNodeByPath(graphData.nodes, link.targetPath)
      return new InterTpLink(link, sourceTp, targetTp)
    })
    this._groupByOverlapLinks()
    this._adjustLineOverlap()
  }

  /**
   * Loop for each (tp-tp type) link.
   * @param {number} startIndex - Index of links array.
   * @param {InterTpLinkCreator-forEachTpTpLinkCallback} callback - Callback for each link.
   * @private
   */
  _forEachTpTpLink(startIndex, callback) {
    for (let i = startIndex; i < this.links.length; i++) {
      // Overlapping check is necessary for each 'tp-tp' type links,
      // except 'support-tp' links.
      if (this.links[i].type === 'support-tp') {
        continue // ignore support-tp link
      }
      /**
       * @callback InterTpLinkCreator-forEachTpTpLinkCallback
       * @param {number} i - Index of link.
       * @param {InterTpLink} link - Inter term-point link.
       */
      callback(i, this.links[i])
    }
  }

  /**
   * Grouping overlapped links, and identify its group as overlap-index.
   * @private
   */
  _groupByOverlapLinks() {
    let overlapIndex = 0
    // record overwriting of overlap-index (overlap group).
    const overwriteIndex = {}

    // To set overlapIndex for last entry, counter:i must loop at last.
    this._forEachTpTpLink(0, (i, linkI) => {
      let oi = overlapIndex
      if (linkI.hasOverlapIndex()) {
        oi = linkI.overlapIndex
      } else {
        linkI.overlapIndex = overlapIndex
        overlapIndex++
      }
      this._forEachTpTpLink(i + 1, (j, linkJ) => {
        if (linkI.isOverlap(linkJ)) {
          if (linkJ.hasOverlapIndex() && oi !== linkJ.overlapIndex) {
            overwriteIndex[oi] = linkJ.overlapIndex
          }
          linkJ.overlapIndex = oi
        }
      })
    })
    // integrate indirect overlapped links.
    // write back overlap-index if overwrote.
    this.links.forEach(link => {
      if (link.overlapIndex in overwriteIndex) {
        link.overlapIndex = overwriteIndex[link.overlapIndex]
      }
    })
  }

  /**
   * Filter slash-type links.
   * <pre>
   *          a b
   *          | |
   *   +------+ |
   *   | +------+
   *   | |   sequence of slash type link
   *   a b   (a -> b)
   * </pre>
   * @param {Array<InterTpLink>} overlappedLinks - Links. (a overlap-group)
   * @returns {Array<InterTpLink>} Slash-type links.
   * @private
   */
  _slashLinks(overlappedLinks) {
    return overlappedLinks
      .filter(link => link.isSkewSlash())
      .sort((a, b) => (a.xMax() < b.xMax() ? -1 : 1))
  }

  /**
   * Filter backslash-type (NOT slash-type) links.
   * <pre>
   *   b a   sequence of backslash type link
   *   | |   (a -> b)
   *   | +------+           +------+   sequence of
   *   +------+ |           | +--+ |   horizontal link
   *          | |           | |  | |   (without crossing)
   *          b a           a b  b a   (a -> b)
   * </pre>
   * @param {Array<InterTpLink>} overlappedLinks - Links. (a overlap-group)
   * @returns {Array<InterTpLink>} Backslash-type links.
   * @private
   */
  _backslashLinks(overlappedLinks) {
    return overlappedLinks
      .filter(link => !link.isSkewSlash()) // NOT slash: backslash, horizontal, vertical
      .sort((a, b) => (a.xMax() < b.xMax() ? 1 : -1))
  }

  /**
   * Displace y-mid of link in overlap-group.
   * @param {Array<InterTpLink>} overlappedLinks - Links. (a overlap-group)
   * @private
   */
  _displaceYMidOfLinksIn(overlappedLinks) {
    const slashLinks = this._slashLinks(overlappedLinks)
    const backslashLinks = this._backslashLinks(overlappedLinks)
    const links = slashLinks.concat(backslashLinks)

    const yMidSum = links
      .map(link => link.yMid)
      .reduce((sum, val) => sum + val, 0)
    const yMidBase = yMidSum / links.length // average of yMid
    let yMidOffset = 0

    for (const [i, link] of links.entries()) {
      if (i > 0 && link.isOverlapX(links[i - 1])) {
        //    i-1    i i+1
        //     |     |  |
        //  *--+  +--+  | <--- align yMid
        //  | +---(-----*
        //  | |   |
        // link[i-1] and link[i] are not overlapped
        // but same group because they have same overlapped link.
        yMidOffset += link.lineWidth * 3
      }
      link.yMid = yMidBase + yMidOffset
    }
  }

  /**
   * Adjust link overlapping for each overlap-group links.
   * @private
   */
  _adjustLineOverlap() {
    const uniqOverlapIndex = new Set(this.links.map(link => link.overlapIndex))
    for (const oi of Array.from(uniqOverlapIndex)) {
      const overlappedLinks = this._linksWith('overlapIndex', oi)
      if (overlappedLinks.length <= 1) {
        continue
      }
      this._displaceYMidOfLinksIn(overlappedLinks)
    }
  }

  /**
   * Filter links with any attribute(key) and value.
   * @param {string} attribute - Attribute for filter.
   * @param {*} value - Value of attribute.
   * @returns {Array<InterTpLink>} Filtered links.
   * @private
   */
  _linksWith(attribute, value) {
    return this.links.filter(link => link[attribute] === value)
  }

  /**
   * Get support-tp type links.
   * @returns {Array<InterTpLink>} Links.
   * @public
   */
  supportTpLinks() {
    return this._linksWith('type', 'support-tp')
  }

  /**
   * Get tp-tp type links.
   * @returns {Array<InterTpLink>} Links.
   * @public
   */
  tpTpLinks() {
    return this._linksWith('type', 'tp-tp')
  }

  /**
   * Get all links.
   * @returns {Array<InterTpLink>} Links.
   * @public
   */
  toData() {
    return this.links
  }
}

export default InterTpLinkCreator
