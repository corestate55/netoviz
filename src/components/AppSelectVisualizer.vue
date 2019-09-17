<template>
  <v-select
    v-model="visualizer"
    v-bind:items="visualizers"
    label="visualizer"
  />
</template>

<script>
export default {
  data () {
    return {
      visualizers: ['Topology', 'Dependency', 'Dependency2', 'Nested']
    }
  },
  computed: {
    visualizer: {
      get () {
        return this.$store.getters.visualizer
      },
      set (value) {
        this.$store.commit('setVisualizer', value)
      }
    }
  }
}
</script>

<style scoped></style>
