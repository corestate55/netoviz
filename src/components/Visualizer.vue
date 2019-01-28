<template>
  <div id="visualizer-container">
    <div id="visualizer-state-debug" v-bind:style="{display: debug}">
      <p>Visualizer Component (UI Debug)</p>
      <ul>
        <li>Visualizer = {{ visualizer }}</li>
        <li>Model File = {{ modelFile }}</li>
        <ul>
          <li v-for="layer in selectedLayers" v-bind:key="layer">{{ layer }}</li>
        </ul>
      </ul>
    </div>
    <TopologyVisualizer v-bind:model="modelFile" v-if="visualizer === 'Topology'"/>
    <DependencyVisualizer v-bind:model="modelFile" v-else-if="visualizer === 'Dependency'" />
  </div>
</template>

<script>
import TopologyVisualizer from './TopologyVisualizer'
import DependencyVisualizer from './DependencyVisualizer'

export default {
  data () {
    return {
      debug: 'none' // block to appear debug container
    }
  },
  components: {
    TopologyVisualizer,
    DependencyVisualizer
  },
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
  }
}
</script>

<style lang="scss" scoped>
</style>
