<template>
  <div id="visualizer">
    <div v-bind:style="{ display: debug }">Dependency model: {{ modelFile }}</div>
    <!-- entry point of d3 graph(s) -->
  </div>
</template>

<script>
import DepGraphVisualizer from '../dep-graph/visualizer'
import '../css/dep-graph.scss'

const visualizer = new DepGraphVisualizer()

export default {
  data () {
    return {
      debug: 'none' // 'none' or 'block' to appear debug container
    }
  },
  computed: {
    modelFile () {
      return this.$store.getters.modelFile
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
