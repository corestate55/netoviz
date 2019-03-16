<template>
  <div id="visualizer">
    <div
      v-bind:style="{ display: debug }"
    >
      Nested model: {{ modelFile }}
      Alert Row: {{ currentAlertRow ? currentAlertRow.id : 'NOT selected' }}
    </div>
    <!-- entry point of d3 graph(s) -->
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'VisualizeDiagramNested.vue',
  data () {
    return {
      visualizer: null,
      debug: 'block' // 'none' or 'block' to appear debug container
    }
  },
  computed: {
    ...mapGetters(['currentAlertRow', 'modelFile'])
  }
}
</script>

<style lang="scss" scoped>
</style>
