<template>
  <div>
    <v-row v-if="debug">
      <v-col>
        <div>
          visualize diagram dependency
          <ul>
            <li>Model File: {{ modelFile }}</li>
            <li>Alert Host: {{ alertHost }}</li>
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
import DependencyDiagramVisualizer from '~/lib/diagram/dependency/visualizer'
import '~/lib/style/dependency.scss'

export default {
  mixins: [VisualizeDiagramCommon],
  data: () => ({
    visualizerName: 'dependency',
    debug: false
  }),
  methods: {
    makeVisualizer() {
      return new DependencyDiagramVisualizer(this.svgWidth, this.svgHeight)
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
