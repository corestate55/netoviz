import grpcClient from '../grpc-client'

const getAlertsViaGRPC = async alertLimit => {
  const response = await grpcClient.getAlerts(alertLimit)
  return response.toObject().alertsList
}

const getAlertsViaREST = async alertLimit => {
  const response = await fetch(`/api/alert/${alertLimit}`)
  return response.json()
}

const getAlertsFromServer = async alertLimit => {
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

export default getAlertsFromServer
