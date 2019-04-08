<template>
  <div id="visualizer">
    <el-button
      round
      size="small"
      type="primary"
      v-on:click="toggleViewPoint()"
    >
      Change to {{ reverse ? 'Top' : 'Bottom' }} View
    </el-button>
    <el-button
      round
      size="small"
      type="primary"
      v-on:click="toggleDeepNest()"
      >
      Change to {{ deep ? 'Shallow' : 'Deep' }} View
    </el-button>
    <el-button
      round
      size="small"
      type="warning"
      v-on:click="saveLayout()"
    >
      Save Layout
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
      deep: false,
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
    toggleDeepNest () {
      this.deep = !this.deep
      this.drawJsonModel()
    },
    saveLayout () {
      this.visualizer.saveLayout(this.modelFile, this.reverse, this.deep)
    },
    drawJsonModel () {
      if (this.modelFile) {
        this.visualizer.drawJsonModel(
          this.modelFile, this.currentAlertRow, this.reverse, this.deep
        )
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
