<template>
  <div>
    <v-row v-if="debug">
      <v-col>
        <div>
          visualize force-simulation diagram.
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
    <!-- DO NOT use resizeSVG() for force-simulation visualizer. -->
    <v-row>
      <v-col>
        <!-- entry point of d3 diagram(s) -->
        <div id="visualizer" />
      </v-col>
    </v-row>
  </div>
</template>

<script>
import VisualizeDiagramCommon from './VisualizeDiagramCommon'
import VisualizeDiagramSelectLayer from './VisualizeDiagramSelectLayer'
import ForceSimulationDiagramVisualizer from '~/lib/diagram/force-simulation/visualizer'
import '~/lib/style/force-simulation.scss'

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
      return new ForceSimulationDiagramVisualizer()
    },
    watchCurrentAlertRow(newRow, oldRow) {
      // only change highlight.
      // no need to redraw because force-simulation diagrams draws all elements at first.
      this.highlightByAlert(newRow)
    },
    clearAllHighlight() {
      this.visualizer.clearAllHighlight()
    },
    drawRfcTopologyData() {
      const getLayerNames = graphs => {
        // When the visualizer draws force-simulation diagram,
        // vue doesn't wait SVG DOM rendering and run next setLayerDisplayStyle().
        // so, these setLayerDisplayStyle() could not found target layer container
        // WORKAROUND :
        //   FORCE to select all layers
        //   to avoid mismatch between UI (layer selector) and Graph.
        this.wholeLayers = graphs.map(layer => layer.name)
      }
      this.visualizer.drawRfcTopologyData(
        this.modelFile,
        this.currentAlertRow,
        getLayerNames
      )
    }
  }
}
</script>

<style lang="scss" scoped></style>
