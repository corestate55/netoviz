<template>
  <div id="visualizer">
    <div
      v-bind:style="{ display: debug }"
    >
      Dependency model: {{ modelFile }}
      Alert Row: {{ currentAlertRow ? currentAlertRow.id : 'NOT selected'}}
    </div>
    <!-- entry point of d3 graph(s) -->
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
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
    ...mapGetters(['currentAlertRow', 'modelFile'])
  },
  methods: {
    drawJsonModel () {
      if (this.modelFile) {
        visualizer.drawJsonModel(this.modelFile, this.currentAlertRow)
      }
    },
    highlightByAlert (alertRow) {
      if (alertRow) {
        visualizer.highlightByAlert(alertRow)
      } else {
        visualizer.clearDependencyLines()
        visualizer.clearHighlight()
      }
    }
  },
  mounted () {
    // console.log('## mounted ##')
    this.drawJsonModel()
    // set watcher for alert selection change
    this.$store.watch(
      state => state.currentAlertRow,
      (newRow, oldRow) => { this.highlightByAlert(newRow) }
    )
  }
}
</script>

<style lang="scss" scoped>
</style>
