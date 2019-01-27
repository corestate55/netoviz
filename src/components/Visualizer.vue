<template>
  <div id="visualizer-container">
    <p>Visualizer Component (UI Debug)</p>
    <ul>
      <li>Visualizer = {{ visualizer }}</li>
      <li>Model File = {{ modelFile }}</li>
      <ul>
        <li v-for="layer in selectedLayers" v-bind:key="layer">{{ layer }}</li>
      </ul>
    </ul>
    <div id="visualizer">
      <!-- entry point of d3 graph(s) -->
    </div>
  </div>
</template>

<script>
import { VisualizerController } from '@/visualizer-controller'
const vControl = new VisualizerController()

export default {
  computed: {
    visualizer () {
      return this.$store.getters.visualizer
    },
    modelFile () {
      return this.$store.getters.modelFile
    },
    selectedLayers () {
      return this.$store.getters.selectedLayers
    }
  },
  updated: function () {
    vControl.startApp(this.visualizer, this.modelFile)
  }
}
</script>

<style lang="scss" scoped>
</style>
