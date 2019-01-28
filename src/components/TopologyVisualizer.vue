<template>
  <div id="visualizer">
    <div  v-bind:style="{display: debug}">Topology model: {{ modelFile }}</div>
    <!-- entry point of d3 graph(s) -->
  </div>
</template>

<script>
import { GraphVisualizer } from '../topo-graph/visualizer'
import '../css/topo-graph.scss'

const visualizer = new GraphVisualizer()

export default {
  data () {
    return {
      debug: 'block' // 'none' or 'block' to appear debug container
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
    }
  },
  methods: {
    drawJsonModel () {
      if (this.modelFile) {
        visualizer.drawJsonModel(this.modelFile)
      }
    }
  },
  updated () { this.drawJsonModel() },
  mounted () { this.drawJsonModel() }
}
</script>

<style lang="scss" scoped>
</style>
