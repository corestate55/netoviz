<template>
  <div>
    <v-row v-if="debug">
      <v-col>
        <div>
          visualize force-simulation diagram.
          <ul>
            <li>Model File: {{ modelFile }}</li>
            <li>Whole Layers: {{ wholeLayers }}</li>
            <li>Alert Host: {{ alertHost }}</li>
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
    visualizerName: 'forceSimulation',
    debug: false
  }),
  methods: {
    makeVisualizer() {
      return new ForceSimulationDiagramVisualizer()
    },
    afterMakeVisualizer() {
      const getLayerNames = graphs => {
        // When the visualizer draws force-simulation diagram,
        // vue doesn't wait SVG DOM rendering and run next setLayerDisplayStyle().
        // so, these setLayerDisplayStyle() could not found target layer container
        // WORKAROUND :
        //   FORCE to select all layers
        //   to avoid mismatch between UI (layer selector) and Graph.
        this.wholeLayers = graphs.map(layer => layer.name)
      }
      this.visualizer.setUISideDrawRfcTopologyHook(getLayerNames)
    },
    watchAlertHost(newValue, oldValue) {
      // only change highlight.
      // no need to redraw because force-simulation diagrams draws all elements at first.
      this.highlightByAlert(newValue)
    },
    clearAllHighlight() {
      this.visualizer.clearAllHighlight()
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
