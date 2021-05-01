/**
 * @file Alert table operation
 */

import db from '../../../db/models'

/**
 * @typedef {Object} AlertData
 * @prop {number} [id] - ID (server-side)
 * @prop {string} host - Host name.
 * @prop {string} severity - Alert severity.
 * @prop {string} date - Timestamp string.
 * @prop {string} message - Alert message.
 * @prop {string} [createdAt] - Timestamp string (server-side).
 * @prop {string} [updatedAt] - Timestamp string (server-side).
 */

/**
 * Alert (same as gRPC Array message)
 * @see server/api/grpc/topology-data.proto
 */
class Alert {
  /**
   * @param {AlertData} obj - Alert data.
   */
  constructor(obj) {
    this.id = obj.id // auto-numbering when added to DB.
    this.host = obj.host
    this.severity = obj.severity
    this.date = this._date2string(obj.date)
    this.message = obj.message
    this.createdAt = this._date2string(obj.createdAt)
    this.updatedAt = this._date2string(obj.updatedAt)
    // debug
    // console.log(this.toGRPCArray())
  }

  /**
   * Arrays to convert grpc message.
   * @returns {Array} - Values.
   */
  toGRPCArray() {
    // MUST be same sequence of gRPC Array message.
    return [
      this.id,
      this.host,
      this.severity,
      this.date,
      this.message,
      this.createdAt,
      this.updatedAt
    ]
  }

  /**
   * Convert date string or instance to string.
   * @param {Object|String} dateOrStr - Date object or string.
   * @returns {string} - Date string.
   * @private
   */
  _date2string(dateOrStr) {
    const str =
      typeof dateOrStr === 'string' ? dateOrStr : dateOrStr?.toISOString()
    return str || new Date().toISOString()
  }
}

/**
 * Alert table
 */
class AlertTable {
  /**
   * Add a new alert log into alert table.
   * @param {AlertData} alertData - Alert data.
   * @public
   */
  addAlert(alertData) {
    db.alert.create(new Alert(alertData)).then((instance) => {
      console.log('create instance: ', instance.dataValues)
    })
  }

  /**
   * Get several alerts.
   * @param {number} number - Number of alerts.
   * @returns {Promise<Array<Alert>>} - Alerts.
   * @public
   */
  async alerts(number) {
    const opts = {
      limit: number,
      order: [['id', 'DESC']]
    }
    const alerts = await db.alert.findAll(opts)
    return alerts.map((d) => new Alert(d.dataValues))
  }

  /**
   * Get all alerts.
   * @returns {Promise<Array<Alert>>} - Alerts.
   * @public
   */
  async allAlerts() {
    const opts = { order: [['id', 'DESC']] }
    const alerts = await db.alert.findAll(opts)
    return alerts.map((d) => new Alert(d.dataValues))
  }
}

export default AlertTable
