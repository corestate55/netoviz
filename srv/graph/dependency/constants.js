export default class DepGraphConstants {
  constructor () {
    // tp
    this.tpR = 20
    this.tpXPad1 = 12
    this.tpXPad2 = 12
    this.tpYPad1 = 12
    this.tpYPad2 = 24
    // node
    this.nodeXPad1 = 15
    this.nodeXPad2 = 15
    this.nodeYPad1 = 15
    this.nodeYPad2 = 24
    // layer
    this.layerXPad1 = 100
    this.layerYPad1 = 50
    this.layerYPad2 = 30
  }

  nodeHeight () {
    return this.tpYPad1 + 2 * this.tpR + this.tpYPad2 // fixed value
  }
}
