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
import DistanceDiagramVisualizer from '../lib/diagram/distance/visualizer'
import VisualizeDiagramCommon from './VisualizeDiagramCommon'
import '~/lib/style/distance.scss'

export default {
  mixins: [VisualizeDiagramCommon],
  data: () => ({ debug: false }),
  methods: {
    makeVisualizer(width, height) {
      return new DistanceDiagramVisualizer(width, height)
    },
    drawRfcTopologyData() {
      this.visualizer.drawRfcTopologyData(
        this.modelFile,
        this.currentAlertRow,
        this.currentAlertRow && this.currentAlertRow.layer // from AlertHost Input (layer__node)
      )
    }
  }
}
</script>

<style lang="scss" scoped></style>
