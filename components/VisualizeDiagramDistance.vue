<template>
  <div>
    <v-row v-if="debug">
      <v-col>
        <div>
          visualize distance
          <ul>
            <li>Distance model: {{ modelFile }}</li>
            <li>
              Alert Row:
              {{ currentAlertRow ? currentAlertRow.id : 'NOT selected' }}
            </li>
          </ul>
        </div>
      </v-col>
    </v-row>
    <v-row v-resize="resizeSVG">
      <v-col>
        <!-- entry point of d3 diagram(s) -->
        <div id="visualizer" />
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapMutations } from 'vuex'
import DistanceDiagramVisualizer from '../lib/diagram/distance/visualizer'
import VisualizeDiagramCommon from './VisualizeDiagramCommon'
import '~/lib/style/distance.scss'

export default {
  mixins: [VisualizeDiagramCommon],
  data: () => ({ debug: false }),
  methods: {
    ...mapMutations('alert', ['setAlertHost']),
    makeVisualizer(width, height) {
      return new DistanceDiagramVisualizer(width, height)
    },
    clearAllHighlight() {
      this.visualizer.clearHighlight()
    },
    afterMakeVisualizer() {
      this.visualizer.setUISideNodeClickHook(this.nodeClickCallback)
    },
    drawRfcTopologyData() {
      const params = {
        layer: this.currentAlertRow?.layer // from AlertHost Input (layer__node)
      }
      this.visualizer.drawRfcTopologyData(
        this.modelFile,
        this.currentAlertRow,
        params
      )
    },
    nodeClickCallback(nodeData) {
      // re-construct path with layer-name and name attribute,
      // because path has deep-copy identifier (::N).
      const path = [nodeData.path.split('__').shift(), nodeData.name].join('__')
      this.setAlertHost(path)
    }
  }
}
</script>

<style lang="scss" scoped></style>
