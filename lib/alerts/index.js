/**
 * @file Functions for alert table.
 */

import colors from 'vuetify/es5/util/colors'
import grpcClient from '../grpc-client'

/**
 * Get alerts using gRPC.
 * @param {number} alertLimit - Number of alerts.
 * @returns {Promise<Array<AlertData>>} - Alerts.
 */
const getAlertsViaGRPC = async alertLimit => {
  const response = await grpcClient.getAlerts(alertLimit)
  return response.toObject().alertsList
}

/**
 * Get alerts using REST.
 * @param {number} alertLimit - Number of alerts.
 * @returns {Promise<Array<AlertData>>} - Alerts.
 */
const getAlertsViaREST = async alertLimit => {
  const response = await fetch(`/api/alert/${alertLimit}`)
  return response.json()
}

/**
 * Get alerts.
 * @param {number} alertLimit - Number of alerts.
 * @returns {Promise<Array<AlertData>>} - Alerts.
 */
export const getAlertsFromServer = async alertLimit => {
  try {
    if (process.env.NODE_ENV === 'development') {
      return await getAlertsViaGRPC(alertLimit)
    } else {
      return await getAlertsViaREST(alertLimit)
    }
  } catch (error) {
    console.error('[getAlertsFromServer] get alerts failed: ', error)
  }
}

/**
 * @typedef {Object} AlertColorDefinition
 * @prop {string} severity - Severity of alert.
 * @prop {string} fill - Color for HTML 'fill' property.
 * @prop {string} text - Color for HTML 'text' property.
 */
/**
 * Table of color definitions for alerts.
 * @type {Array<AlertColorDefinition>}
 */
const colorTable = Object.freeze(
  [
    {
      severity: 'default',
      fill: colors.grey.darken1, // grey
      text: colors.grey.lighten5
    },
    {
      severity: 'disaster',
      fill: colors.red.lighten1, // bright red
      text: colors.grey.lighten5
    },
    {
      severity: 'high',
      fill: colors.red.darken4, // red
      text: colors.grey.lighten5
    },
    {
      severity: 'average',
      fill: colors.orange.lighten1, // orange
      text: colors.grey.darken4
    },
    {
      severity: 'warning',
      fill: colors.yellow.accent3, // bright yellow
      text: colors.grey.darken4
    },
    {
      severity: 'information',
      fill: colors.lightGreen.darken1, // bright green
      text: colors.grey.lighten5
    }
  ].map(d => Object.freeze(d))
)

/**
 * Find color definition for specified severity and HTML property.
 * @param {string} prop - HTML property to set the color.
 * @param {string }severity - Severity of Alert.
 * @returns {AlertColorDefinition} - Color definition.
 */
export const severityColor = (prop, severity) => {
  const findColorDefBySeverity = s =>
    colorTable.find(d => d.severity === s.toLowerCase())
  const colorDef =
    findColorDefBySeverity(severity) || findColorDefBySeverity('default')
  return colorDef[prop]
}
