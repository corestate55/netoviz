import { promisify } from 'util'
import messages from '~/server/api/grpc/topology-data_pb'
import services from '~/server/api/grpc/topology-data_grpc_web_pb'

const getAlertsViaGRPC = async alertLimit => {
  const host = window.location.hostname
  const port = process.env.NETOVIZ_GRPC_WEB_PORT
  const uri = `http://${host}:${port}`
  const client = new services.TopologyDataClient(uri, null, null)

  const request = new messages.AlertRequest()
  request.setNumber(alertLimit)

  const getAlerts = promisify(client.getAlerts).bind(client)
  const response = await getAlerts(request, {})

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
