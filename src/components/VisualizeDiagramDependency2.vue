<template>
  <div id="visualizer">
    <div
      v-bind:style="{ display: debug }"
    >
      Dependency2 Graph ::
      Dependency model: {{ modelFile }}
      Alert Row: {{ currentAlertRow ? currentAlertRow.id : 'NOT selected' }}
    </div>
    <!-- entry point of d3 graph(s) -->
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Dep2GraphVisualizer from '../graph/dependency2/visualizer'
import '../css/dependency.scss'

export default {
  name: 'VisualizeDiagramDependency2',
  data () {
    return {
      visualizer: null,
      unwatchCurrentAlertRow: null,
      unwatchModelFile: null,
      debug: 'none' // 'none' or 'block' to appear debug container
    }
  },
  computed: {
    ...mapGetters(['currentAlertRow', 'modelFile'])
  },
  mounted () {
    console.log('[dep2] mounted')
    const svgWidth = window.innerWidth * 0.95
    const svgHeight = window.innerHeight * 0.8
    this.visualizer = new Dep2GraphVisualizer(svgWidth, svgHeight)

    this.drawJsonModel()
    // set watcher for alert selection change
    this.unwatchCurrentAlertRow = this.$store.watch(
      state => state.currentAlertRow,
      (newRow, oldRow) => {
        // console.log('[dep2] change currentAlertRow: ', newRow, oldRow)
        this.drawJsonModel()
        this.highlightByAlert(newRow)
      }
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
    this.unwatchCurrentAlertRow()
    this.unwatchModelFile()
  },
  methods: {
    drawJsonModel () {
      // console.log('[dep2] drawJsonModel: ', this.modelFile, this.currentAlertRow)
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
  }
}
</script>

<style lang="scss" scoped>
</style>
