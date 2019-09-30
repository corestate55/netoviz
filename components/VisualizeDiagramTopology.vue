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
            <li>Selected layers: {{ selectedLayers }}</li>
            <li>NOT selected layers: {{ notSelectedLayers }}</li>
          </ul>
        </div>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-select
          v-model="selectedLayers"
          v-bind:items="wholeLayers"
          chips
          multiple
          v-on:change="displaySelectedLayers"
        />
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
import { select } from 'd3-selection'
import VisualizeDiagramCommon from './VisualizeDiagramCommon'
import TopoGraphVisualizer from '~/lib/graph/topology/visualizer'
import '~/lib/style/topology.scss'

export default {
  mixins: [VisualizeDiagramCommon],
  data() {
    return {
      unwatchSelectedLayers: null,
      wholeLayers: [],
      selectedLayers: [],
      debug: false
    }
  },
  computed: {
    notSelectedLayers() {
      return this.wholeLayers.filter(
        layer => !this.selectedLayers.includes(layer)
      )
    }
  },
  mounted() {
    console.log('[topo] mounted')
    // exec after VisualizeDiagramCommon.mounted() [merged].
    // `this.wholeLayers` is initialized in drawJsonModel().
    // set selectedLayer initial value after initial drawJsonModel() exec.
    // (at once)
    this.selectedLayers = this.wholeLayers
  },
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
    beforeMakeVisualizer() {
      this.unwatchSelectedLayers = this.$store.watch(
        state => state.selectedLayers,
        newLayers => {
          this.displaySelectedLayers()
        }
      )
    },
    afterDeleteVisualizer() {
      this.unwatchSelectedLayers()
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
        this.selectedLayers = this.wholeLayers
      }
      this.visualizer.drawJsonModel(
        this.modelFile,
        this.currentAlertRow,
        getLayerNames
      )
      this.displaySelectedLayers()
    },
    setLayerDisplayStyle(layers, display) {
      for (const layer of layers) {
        select(`[id='${layer}-container']`).style('display', display)
      }
    },
    displaySelectedLayers() {
      // set display style of selecte(or not) layers
      this.setLayerDisplayStyle(this.selectedLayers, 'block')
      this.setLayerDisplayStyle(this.notSelectedLayers, 'none')
    }
  }
}
</script>

<style lang="scss" scoped></style>
