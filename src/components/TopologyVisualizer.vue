<template>
  <div id="visualizer">
    <div  v-bind:style="{ display: debug }">
      <ul>
        <li>Topology model: {{ modelFile }}</li>
        <li>Whole layers: {{ wholeLayers }}</li>
        <li>Selected layers: {{ selectedLayers }}</li>
        <li>NOT selected layers: {{ notSelectedLayers }}</li>
      </ul>
    </div>
    <!-- entry point of d3 graph(s) -->
  </div>
</template>

<script>
import GraphVisualizer from '../topo-graph/visualizer'
import '../css/topo-graph.scss'

const visualizer = new GraphVisualizer()

export default {
  data () {
    return {
      debug: 'none', // 'none' or 'block' to appear debug container
      oldModelFile: ''
    }
  },
  computed: {
    modelFile () {
      return this.$store.getters.modelFile
    },
    selectedLayers () {
      return this.$store.getters.selectedLayers
    },
    wholeLayers () {
      return this.$store.getters.wholeLayers
    },
    notSelectedLayers () {
      return this.wholeLayers.filter(
        // <0: index not found: not exist in selected layers
        layer => this.selectedLayers.indexOf(layer) < 0
      )
    }
  },
  methods: {
    setLayerDisplayStyle (layers, display) {
      for (const layer of layers) {
        const elm = document.getElementById(`${layer}-container`)
        if (elm) {
          elm.style.display = display
        }
      }
    },
    drawJsonModel () {
      // redraw whole graph ONLY when model file changed.
      if (this.modelFile !== this.oldModelFile) {
        visualizer.drawJsonModel(this.modelFile)
        // When the visualizer draws topology graph,
        // vue doesn't wait SVG DOM rendering and run next setLayerDisplayStyle().
        // so, these setLayerDisplayStyle() could not found target layer container
        // WORKAROUND :
        //   FORCE to select all layers
        //   to avoid mismatch between UI (layer selector) and Graph.
        this.$store.dispatch('selectAllLayers')
        this.oldModelFile = this.modelFile
      }
      // set display style of selecte(or not) layers
      this.setLayerDisplayStyle(this.selectedLayers, 'block')
      this.setLayerDisplayStyle(this.notSelectedLayers, 'none')
    }
  },
  updated () { this.drawJsonModel() },
  mounted () { this.drawJsonModel() }
}
</script>

<style lang="scss" scoped>
</style>
