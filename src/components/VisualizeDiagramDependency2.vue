<template>
  <div id="visualizer">
    <div
      v-bind:style="{ display: debug }"
    >
      Dependency2 Graph ::
      Dependency model: {{ modelFile }}
      Alert Row: {{ currentAlertRow ? currentAlertRow.id : 'NOT selected'}}
    </div>
    <!-- entry point of d3 graph(s) -->
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Dep2GraphVisualizer from '../graph/dependency2/visualizer'
import '../css/dependency2.scss'

export default {
  name: 'VisualizeDiagramDependency2',
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
    console.log('[dep2] mounted')
    this.visualizer = new Dep2GraphVisualizer()

    this.drawJsonModel()
    // set watcher for alert selection change
    this.unwatchAlert = this.$store.watch(
      state => state.currentAlertRow,
      (newRow, oldRow) => { this.highlightByAlert(newRow) }
    )
    this.unwatchModelFile = this.$store.watch(
      state => state.modelFile,
      (newModelFile, oldModelFile) => {
        console.log(`[dep2] modelFile changed from ${oldModelFile} to ${newModelFile}`)
        this.clearAllHighlight()
        this.drawJsonModel()
      }
    )
  },
  beforeDestroy () {
    console.log('[dep2] before destroy')
    delete this.visualizer
    this.unwatchAlert()
    this.unwatchModelFile()
  }
}
</script>

<style lang="scss" scoped>
</style>
