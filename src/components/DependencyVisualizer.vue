<template>
  <div id="visualizer">
    <div v-bind:style="{display: debug}">Dependency model: {{ model }}</div>
    <!-- entry point of d3 graph(s) -->
  </div>
</template>

<script>
import { DepGraphVisualizer } from '../dep-graph/visualizer'
import '../css/dep-graph.scss'

const visualizer = new DepGraphVisualizer()

export default {
  data () {
    return {
      debug: 'none' // block to appear debug container
    }
  },
  props: ['model'],
  methods: {
    drawJsonModel () {
      if (this.model) {
        visualizer.drawJsonModel(this.model)
      }
    }
  },
  updated () { this.drawJsonModel() },
  mounted () { this.drawJsonModel() }
}
</script>

<style lang="scss" scoped>
</style>
