<template>
  <VisualizeDiagram
    v-bind:model-file="modelFile"
    v-bind:visualizer="visualizer"
  />
</template>

<script>
import VisualizeDiagram from '~/components/VisualizeDiagram'

export default {
  components: {
    VisualizeDiagram
  },
  computed: {
    visualizer() {
      return this.$nuxt.$route.params.visualizer
    },
    modelFile() {
      return this.$nuxt.$route.params.modelFile
    }
  }
}
</script>

<style scoped></style>
