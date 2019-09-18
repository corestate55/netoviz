<template>
  <div>
    <v-row v-if="debug">
      <v-col>
        <div>
          visualize diagram topology
          <ul>
            <li>Topology model: {{ modelFile }}</li>
            <li>Whole layers: {{ wholeLayers }}</li>
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
    <v-row>
      <v-col>
        <!-- entry point of d3 graph(s) -->
        <div id="visualizer" />
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { select } from 'd3-selection'
import TopoGraphVisualizer from '../graph/topology/visualizer'
import '../css/topology.scss'

export default {
  props: {
    modelFile: {
      type: String,
      default: '',
      require: true
    }
  },
  data () {
    return {
      visualizer: null,
      unwatchAlert: null,
      unwatchSelectedLayers: null,
      unwatchModelFile: null,
      wholeLayers: [],
      selectedLayers: [],
      debug: false
    }
  },
  computed: {
    ...mapGetters(['currentAlertRow']),
    notSelectedLayers () {
      return this.wholeLayers.filter(
        // <0: index not found: not exist in selected layers
        layer => this.selectedLayers.indexOf(layer) < 0
      )
    }
  },
  mounted () {
    console.log('[topo] mounted')
    this.visualizer = new TopoGraphVisualizer()
    this.selectedLayers = this.wholeLayers

    this.drawJsonModel()
    this.unwatchAlert = this.$store.watch(
      state => state.currentAlertRow,
      (newRow, oldRow) => {
        this.highlightByAlert(newRow)
      }
    )
    this.unwatchSelectedLayers = this.$store.watch(
      state => state.selectedLayers,
      newLayers => {
        this.displaySelectedLayers()
      }
    )
    this.unwatchModelFile = this.$store.watch(
      state => state.modelFile,
      (newModelFile, oldModelFile) => {
        console.log(
          `[topo] modelFile changed from ${oldModelFile} to ${newModelFile}`
        )
        this.clearAllHighlight()
        this.drawJsonModel()
      }
    )
  },
  beforeDestroy () {
    console.log('[topo] before destroy')
    delete this.visualizer
    this.unwatchAlert()
    this.unwatchSelectedLayers()
    this.unwatchModelFile()
  },
  methods: {
    setLayerDisplayStyle (layers, display) {
      for (const layer of layers) {
        select(`[id='${layer}-container']`).style('display', display)
      }
    },
    drawJsonModel () {
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
    displaySelectedLayers () {
      // set display style of selecte(or not) layers
      this.setLayerDisplayStyle(this.selectedLayers, 'block')
      this.setLayerDisplayStyle(this.notSelectedLayers, 'none')
    },
    clearAllHighlight () {
      this.visualizer.clearAllHighlight()
    },
    highlightByAlert (alertRow) {
      if (alertRow) {
        this.visualizer.highlightByAlert(alertRow)
      } else {
        this.clearAllHighlight()
      }
    }
  }
}
</script>

<style lang="scss" scoped></style>
