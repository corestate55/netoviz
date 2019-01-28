<template>
  <div id="visualizer">
    Topology model: {{model}}
    <!-- entry point of d3 graph(s) -->
  </div>
</template>

<script>
import { GraphVisualizer } from '../topo-graph/visualizer'
import '../css/topo-graph.scss'

const visualizer = new GraphVisualizer()

export default {
  props: ['model'],
  methods: {
    drawJsonModel () {
      if (this.model) {
        visualizer.drawJsonModel(this.model)
      }
    }
  },
  updated: function () { this.drawJsonModel() },
  created: function () { this.drawJsonModel() }
}
</script>

<style lang="scss" scoped>
</style>
