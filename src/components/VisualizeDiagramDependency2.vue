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
    <v-row>
      <v-col>
        <!-- entry point of d3 graph(s) -->
        <div id="visualizer" />
      </v-col>
    </v-row>
  </div>
</template>

<script>
import VisualizeDiagramCommon from './VisualizeDiagramCommon'
import Dep2GraphVisualizer from '../graph/dependency2/visualizer'
import '../css/dependency.scss'

export default {
  mixins: [VisualizeDiagramCommon],
  data: () => ({ debug: false }),
  methods: {
    makeVisualizer (width, height) {
      return new Dep2GraphVisualizer(width, height)
    },
    clearAllHighlight () {
      this.visualizer.clearDependencyLines()
      this.visualizer.clearHighlight()
    },
    drawJsonModel () {
      // console.log('[dep2] drawJsonModel: ', this.modelFile, this.currentAlertRow)
      if (this.modelFile) {
        this.visualizer.drawJsonModel(this.modelFile, this.currentAlertRow)
      }
    }
  }
}
</script>

<style lang="scss" scoped></style>
