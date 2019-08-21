<template>
  <div id="visualizer">
    <el-row v-bind:gutter="20">
      <el-col v-bind:span="5">
        <el-switch
          v-model="reverse"
          v-on:change="drawJsonModel()"
          active-text="Bottom View"
          inactive-text="Top View"
          inactive-color="#13ce66"
        />
      </el-col>
      <el-col v-bind:span="5">
        Depth :
        <el-input-number
          size="small"
          controls-position="right"
          v-model="depth"
          v-on:change="drawJsonModel()"
          v-bind:min="1"
        />
      </el-col>
      <el-col v-bind:span="5">
        <el-button
          round
          size="small"
          type="warning"
          v-on:click="saveLayout()"
        >
          Save Layout
        </el-button>
      </el-col>
    </el-row>
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
      depth: 1,
      unwatchAlert: null,
      unwatchModelFile: null,
      debug: 'none' // 'none' or 'block' to appear debug container
    }
  },
  computed: {
    ...mapGetters(['currentAlertRow', 'modelFile'])
  },
  methods: {
    saveLayout () {
      this.visualizer.saveLayout(this.modelFile, this.reverse, this.depth)
    },
    drawJsonModel () {
      if (this.modelFile) {
        this.visualizer.drawJsonModel(
          this.modelFile, this.currentAlertRow, this.reverse, this.depth
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
    const svgWidth = window.innerWidth * 0.95
    const svgHeight = window.innerHeight * 0.8
    this.visualizer = new NestedGraphVisualizer(svgWidth, svgHeight)
    this.drawJsonModel()

    this.unwatchAlert = this.$store.watch(
      state => state.currentAlertRow,
      (newRow, oldRow) => {
        // this.clearAllHighlight()
        this.drawJsonModel() // redraw suit to alert-target
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
