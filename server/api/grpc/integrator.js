import _toDependencyTopologyData from '../../graph/dependency'
import _toNestedTopologyData from '../../graph/nested'
import _toDistanceTopologyData from '../../graph/distance'
import APIBase from '../common/api-base'

/**
 * gRPC body.
 * @extends {APIBase}
 */
class GRPCIntegrator extends APIBase {
  /**
   * @override
   */
  async toDependencyTopologyData(jsonName, req) {
    /** @type {DependencyGraphQuery} */
    const graphQuery = {
      target: req.getTarget(),
      topologyData: await this.toForceSimulationTopologyData(jsonName)
    }
    return _toDependencyTopologyData(graphQuery)
  }

  /**
   * @override
   */
  async toNestedTopologyData(jsonName, req) {
    /** @type {NestedGraphQuery} */
    const graphQuery = {
      target: req.getTarget(),
      layer: req.getLayer(),
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
    /** @type {DistanceGraphQuery} */
    const graphQuery = {
      target: req.getTarget(),
      layer: req.getLayer(),
      topologyData: await this.toForceSimulationTopologyData(jsonName)
    }
    return _toDistanceTopologyData(graphQuery)
  }
}

export default GRPCIntegrator
