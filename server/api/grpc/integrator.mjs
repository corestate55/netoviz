import _toDependencyTopologyData from '../../graph/dependency'
import _toNestedTopologyData from '../../graph/nested'
import _toDistanceTopologyData from '../../graph/distance'
import APIBase from '../common/api-base'
import { splitAlertHost } from '../common/alert-util'

/**
 * gRPC body.
 * @extends {APIBase}
 */
class GRPCIntegrator extends APIBase {
  /**
   * @override
   */
  async toDependencyTopologyData(jsonName, req) {
    const alert = this.splitAlertHost(req.getAlertHost())
    /** @type {DependencyGraphQuery} */
    const graphQuery = {
      target: alert.host,
      topologyData: await this.toForceSimulationTopologyData(jsonName)
    }
    return _toDependencyTopologyData(graphQuery)
  }

  /**
   * @override
   */
  async toNestedTopologyData(jsonName, req) {
    const alert = this.splitAlertHost(req.getAlertHost())
    /** @type {NestedGraphQuery} */
    const graphQuery = {
      target: alert.host,
      layer: alert.layer,
      depth: req.getDepth(),
      aggregate: req.getAggregate(),
      reverse: req.getReverse(),
      topologyData: await this.toForceSimulationTopologyData(jsonName),
      layoutData: await this.readLayoutJSON(jsonName)
    }
    return _toNestedTopologyData(graphQuery)
  }

  /**
   * @override
   */
  async toDistanceTopologyData(jsonName, req) {
    const alert = this.splitAlertHost(req.getAlertHost())
    /** @type {DistanceGraphQuery} */
    const graphQuery = {
      target: alert.host,
      layer: alert.layer,
      topologyData: await this.toForceSimulationTopologyData(jsonName)
    }
    return _toDistanceTopologyData(graphQuery)
  }

  splitAlertHost(alertHost) {
    return splitAlertHost(alertHost)
  }
}

export default GRPCIntegrator
