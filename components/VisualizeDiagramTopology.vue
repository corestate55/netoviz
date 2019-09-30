<template>
  <div>
    <v-row v-if="debug">
      <v-col>
        <div>
          visualize diagram topology
          <ul>
            <li>Topology model: {{ modelFile }}</li>
            <li>Whole layers: {{ wholeLayers }}</li>
            <li>current Alert Row: {{ currentAlertRow }}</li>
          </ul>
        </div>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <VisualizeDiagramSelectLayer v-bind:whole-layers="wholeLayers" />
      </v-col>
    </v-row>
    <!-- DO NOT use resizeSVG() for topology visualizer. -->
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
import VisualizeDiagramSelectLayer from './VisualizeDiagramSelectLayer'
import TopoGraphVisualizer from '~/lib/graph/topology/visualizer'
import '~/lib/style/topology.scss'

export default {
  components: {
    VisualizeDiagramSelectLayer
  },
  mixins: [VisualizeDiagramCommon],
  data: () => ({
    wholeLayers: [],
    debug: false
  }),
  methods: {
    makeVisualizer(width, height) {
      return new TopoGraphVisualizer()
    },
    watchCurrentAlertRow(newRow, oldRow) {
      // only change highlight.
      // no need to redraw because topo graph draws all object at first.
      this.highlightByAlert(newRow)
    },
    clearAllHighlight() {
      this.visualizer.clearAllHighlight()
    },
    drawJsonModel() {
      const getLayerNames = graphs => {
        // When the visualizer draws topology graph,
        // vue doesn't wait SVG DOM rendering and run next setLayerDisplayStyle().
        // so, these setLayerDisplayStyle() could not found target layer container
        // WORKAROUND :
        //   FORCE to select all layers
        //   to avoid mismatch between UI (layer selector) and Graph.
        this.wholeLayers = graphs.map(layer => layer.name)
      }
      this.visualizer.drawJsonModel(
        this.modelFile,
        this.currentAlertRow,
        getLayerNames
      )
    }
  }
}
</script>

<style lang="scss" scoped></style>
