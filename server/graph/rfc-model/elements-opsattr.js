/**
 * @file define attribute class for ops-topology.
 */

/**
 * Base class of Ops-topology attribute
 */
class OpsAttributeBase {
  /**
   * @param {Object} hash - Hash (Key-value dictionary)
   */
  constructor(hash) {
    if (hash?.class?.match(/Ops.*Attribute/)) {
      // OpsAttribute data
      this.attrBody = hash.attrBody
    } else {
      // Normal object (hash)
      this.attrBody = hash
    }
  }

  toHtml() {
    const list = Object.keys(this.attrBody).map(
      (k) => `<li><span class="attr">${k}:</span> ${this.attrBody[k]}</li>`
    )
    return `<ul>${list.join('')}</ul>`
  }
}

export class OpsNetworkAttribute extends OpsAttributeBase {
  constructor(hash) {
    super(hash)
    this.class = 'OpsNetworkAttribute'
  }
}

export class OpsNodeAttribute extends OpsAttributeBase {
  constructor(hash) {
    super(hash)
    this.class = 'OpsNodeAttribute'
  }
}

export class OpsLinkAttribute extends OpsAttributeBase {
  constructor(hash) {
    super(hash)
    this.class = 'OpsLinkAttribute'
  }
}

export class OpsTermPointAttribute extends OpsAttributeBase {
  constructor(hash) {
    super(hash)
    this.class = 'OpsTermPointAttribute'
  }
}
