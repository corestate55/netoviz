<template>
  <div id="visualizer">
    Dependency model: {{model}}
    <!-- entry point of d3 graph(s) -->
  </div>
</template>

<script>
import { DepGraphVisualizer } from '../dep-graph/visualizer'
import '../css/dep-graph.scss'

const visualizer = new DepGraphVisualizer()

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
