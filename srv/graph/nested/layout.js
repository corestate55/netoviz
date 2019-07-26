export default class NestLayout {
  constructor (reverse, nestType, layoutData) {
    this.reverse = reverse

    if (layoutData && nestType in layoutData) {
      this.layoutData = layoutData[nestType]
    } else {
      this.layoutData = null
    }
  }

  toData () {
    if (this.layoutData) {
      if (this.reverse && 'reverse' in this.layoutData) {
        return this.layoutData.reverse
      } else if (!this.reverse && 'standard' in this.layoutData) {
        return this.layoutData.standard
      }
    }
    return null
  }
}
