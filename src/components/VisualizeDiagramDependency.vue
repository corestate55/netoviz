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

export default {
  data () {
    return {
      visualizer: null,
      unwatchAlert: null,
      unwatchModelFile: null,
      debug: 'none' // 'none' or 'block' to appear debug container
    }
  },
  computed: {
    ...mapGetters(['currentAlertRow', 'modelFile'])
  },
  methods: {
    drawJsonModel () {
      if (this.modelFile) {
        this.visualizer.drawJsonModel(this.modelFile, this.currentAlertRow)
      }
    },
    clearAllHighlight () {
      this.visualizer.clearDependencyLines()
      this.visualizer.clearHighlight()
    },
    highlightByAlert (alertRow) {
      if (alertRow) {
        this.visualizer.highlightByAlert(alertRow)
      } else {
        this.clearAllHighlight()
      }
    }
  },
  mounted () {
    console.log('[dep] mounted')
    this.visualizer = new DepGraphVisualizer()

    this.drawJsonModel()
    // set watcher for alert selection change
    this.unwatchAlert = this.$store.watch(
      state => state.currentAlertRow,
      (newRow, oldRow) => { this.highlightByAlert(newRow) }
    )
    this.unwatchModelFile = this.$store.watch(
      state => state.modelFile,
      (newModelFile, oldModelFile) => {
        console.log(`[dep] modelFile changed from ${oldModelFile} to ${newModelFile}`)
        this.clearAllHighlight()
        this.drawJsonModel()
      }
    )
  },
  beforeDestroy () {
    console.log('[dep] before destroy')
    delete this.visualizer
    this.unwatchAlert()
    this.unwatchModelFile()
  }
}
</script>

<style lang="scss" scoped>
</style>
