<template>
  <div id="visualizer">
    <el-button
      round
      size="small"
      type="info"
      v-on:click="toggleViewPoint()"
    >
      Change to {{ reverse ? 'Top' : 'Bottom'}} View
    </el-button>
    <div
      v-bind:style="{ display: debug }"
    >
      Nested model: {{ modelFile }},
      Alert Row: {{ currentAlertRow ? currentAlertRow.id : 'NOT selected' }},
      Reverse? : {{ reverse }}
    </div>
    <!-- entry point of d3 graph(s) -->
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import NestedGraphVisualizer from '../graph/nested/visualizer'
import '../css/nested.scss'

export default {
  name: 'VisualizeDiagramNested.vue',
  data () {
    return {
      visualizer: null,
      reverse: true,
      unwatchAlert: null,
      unwatchModelFile: null,
      debug: 'none' // 'none' or 'block' to appear debug container
    }
  },
  computed: {
    ...mapGetters(['currentAlertRow', 'modelFile'])
  },
  methods: {
    toggleViewPoint () {
      this.reverse = !this.reverse
      this.drawJsonModel()
    },
    drawJsonModel () {
      if (this.modelFile) {
        this.visualizer.drawJsonModel(this.modelFile, this.currentAlertRow, this.reverse)
      }
    },
    clearAllHighlight () {
      this.visualizer.clearAllAlertHighlight()
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
    console.log('[nested] mounted')
    this.visualizer = new NestedGraphVisualizer()
    this.drawJsonModel()

    this.unwatchAlert = this.$store.watch(
      state => state.currentAlertRow,
      (newRow, oldRow) => {
        this.clearAllHighlight()
        this.highlightByAlert(newRow)
      }
    )
    this.unwatchModelFile = this.$store.watch(
      state => state.modelFile,
      (newModelFile, oldModelFile) => {
        console.log(`[nested] modelFile changed from ${oldModelFile} to ${newModelFile}`)
        this.clearAllHighlight()
        this.drawJsonModel()
      }
    )
  },
  beforeDestroy () {
    console.log('[nested] before destroy')
    delete this.visualizer
    this.unwatchAlert()
    this.unwatchModelFile()
  }
}
</script>

<style lang="scss" scoped>
</style>
