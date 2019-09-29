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
        <!-- entry point of d3 graph(s) -->
        <div id="visualizer" />
      </v-col>
    </v-row>
  </div>
</template>

<script>
import VisualizeDiagramCommon from './VisualizeDiagramCommon'
import Dep2GraphVisualizer from '~/lib/graph/dependency2/visualizer'
import '~/lib/style/dependency.scss'

export default {
  mixins: [VisualizeDiagramCommon],
  data: () => ({ debug: false }),
  methods: {
    makeVisualizer(width, height) {
      return new Dep2GraphVisualizer(width, height)
    },
    clearAllHighlight() {
      this.visualizer.clearDependencyLines()
      this.visualizer.clearHighlight()
    },
    drawJsonModel() {
      this.visualizer.drawJsonModel(this.modelFile, this.currentAlertRow)
    }
  }
}
</script>

<style lang="scss" scoped></style>
