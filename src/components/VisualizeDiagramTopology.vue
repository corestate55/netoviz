<template>
  <div id="visualizer">
    <AppSelectLayer />
    <div  v-bind:style="{ display: debug }">
      <ul>
        <li>
          Topology model: {{ modelFile }}
        </li>
        <li>
          Whole layers: {{ wholeLayers }}
        </li>
        <li>
          Selected layers: {{ selectedLayers }}
        </li>
        <li>
          NOT selected layers: {{ notSelectedLayers }}
        </li>
      </ul>
    </div>
    <!-- entry point of d3 graph(s) -->
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import AppSelectLayer from './AppSelectLayer'
import TopoGraphVisualizer from '../graph/topology/visualizer'
import '../css/topology.scss'

export default {
  components: {
    AppSelectLayer
  },
  data () {
    return {
      visualizer: null,
      unwatchAlert: null,
      unwatchSelectedLayers: null,
      unwatchModelFile: null,
      debug: 'none' // 'none' or 'block' to appear debug container
    }
  },
  computed: {
    ...mapGetters(['currentAlertRow', 'modelFile', 'selectedLayers', 'wholeLayers']),
    notSelectedLayers () {
      return this.wholeLayers.filter(
        // <0: index not found: not exist in selected layers
        layer => this.selectedLayers.indexOf(layer) < 0
      )
    }
  },
  methods: {
    ...mapActions(['selectAllLayers']),
    setLayerDisplayStyle (layers, display) {
      for (const layer of layers) {
        const elm = document.getElementById(`${layer}-container`)
        if (elm) {
          elm.style.display = display
        }
      }
    },
    drawJsonModel () {
      this.visualizer.drawJsonModel(this.modelFile, this.currentAlertRow)
      // When the visualizer draws topology graph,
      // vue doesn't wait SVG DOM rendering and run next setLayerDisplayStyle().
      // so, these setLayerDisplayStyle() could not found target layer container
      // WORKAROUND :
      //   FORCE to select all layers
      //   to avoid mismatch between UI (layer selector) and Graph.
      this.selectAllLayers()
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
  },
  mounted () {
    console.log('[topo] mounted')
    this.visualizer = new TopoGraphVisualizer()

    this.drawJsonModel()
    this.unwatchAlert = this.$store.watch(
      state => state.currentAlertRow,
      (newRow, oldRow) => { this.highlightByAlert(newRow) }
    )
    this.unwatchSelectedLayers = this.$store.watch(
      state => state.selectedLayers,
      (newLayers) => { this.displaySelectedLayers() }
    )
    this.unwatchModelFile = this.$store.watch(
      state => state.modelFile,
      (newModelFile, oldModelFile) => {
        console.log(`[topo] modelFile changed from ${oldModelFile} to ${newModelFile}`)
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
  }
}
</script>

<style lang="scss" scoped>
</style>
