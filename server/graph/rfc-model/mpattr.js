/**
 * Base class of multi-purpose attribute
 */
class MultiPurposeAttributeBase {
  /**
   * @param {Object} hash - Hash (Key-value dictionary)
   */
  constructor(hash) {
    if (hash?.class?.match(/MultiPurpose.*Attribute/)) {
      // MultiPurposeAttribute data
      this.attrBody = hash.attrBody
    } else {
      // Normal object (hash)
      this.attrBody = hash
    }
  }

  toHtml() {
    const list = Object.keys(this.attrBody).map(
      k => `<li><span class="attr">${k}:</span> ${this.attrBody[k]}</li>`
    )
    return `<ul>${list.join('')}</ul>`
  }
}

export class MultiPurposeNetworkAttribute extends MultiPurposeAttributeBase {
  constructor(hash) {
    super(hash)
    this.class = 'MultiPurposeNetworkAttribute'
  }
}

export class MultiPurposeNodeAttribute extends MultiPurposeAttributeBase {
  constructor(hash) {
    super(hash)
    this.class = 'MultiPurposeNodeAttribute'
  }
}

export class MultiPurposeLinkAttribute extends MultiPurposeAttributeBase {
  constructor(hash) {
    super(hash)
    this.class = 'MultiPurposeLinkAttribute'
  }
}

export class MultiPurposeTermPointAttribute extends MultiPurposeAttributeBase {
  constructor(hash) {
    super(hash)
    this.class = 'MultiPurposeTermPointAttribute'
  }
}
