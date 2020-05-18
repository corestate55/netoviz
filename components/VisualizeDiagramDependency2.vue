<template>
  <div>
    <v-row v-if="debug">
      <v-col>
        <div>
          visualize diagram dependency2
          <ul>
            <li>model: {{ modelFile }}</li>
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
import VisualizeDiagramCommon from './VisualizeDiagramCommon'
import Dependency2DiagramVisualizer from '~/lib/diagram/dependency2/visualizer'
import '~/lib/style/dependency.scss'

export default {
  mixins: [VisualizeDiagramCommon],
  data: () => ({
    visualizerName: 'dependency2',
    debug: false
  }),
  methods: {
    makeVisualizer(width, height) {
      return new Dependency2DiagramVisualizer(width, height)
    },
    clearAllHighlight() {
      this.visualizer.clearDependencyLines()
      this.visualizer.clearHighlight()
    },
    drawRfcTopologyData() {
      const params = {
        modelFile: this.modelFile,
        alertHost: this.alertHost
      }
      this.visualizer.drawRfcTopologyData(params)
    }
  }
}
</script>

<style lang="scss" scoped></style>
