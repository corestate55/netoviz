export default class NestLayout {
  constructor (reverse, layoutData) {
    this.reverse = reverse
    this.layoutData = layoutData || null
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
