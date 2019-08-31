<template>
  <div id="visualizer">
    <el-row v-bind:gutter="20">
      <el-col v-bind:span="5">
        <el-switch
          v-model="reverse"
          active-text="Bottom View"
          inactive-text="Top View"
          inactive-color="#13ce66"
          v-on:change="drawJsonModel()"
        />
      </el-col>
      <el-col v-bind:span="5">
        <el-switch
          v-model="autoFitting"
          active-text="Fit Auto"
          inactive-text="Default Layout"
          inactive-color="gray"
          v-on:change="drawJsonModel()"
        />
      </el-col>
      <el-col v-bind:span="5">
        Base depth :
        <el-input-number
          v-model="depth"
          size="small"
          controls-position="right"
          v-bind:min="1"
          v-on:change="drawJsonModel()"
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
      Auto Fitting? : {{ autoFitting }}
    </div>
    <!-- entry point of d3 graph(s) -->
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import NestedGraphVisualizer from '../graph/nested/visualizer'
import '../css/nested.scss'

export default {
  data () {
    return {
      visualizer: null,
      reverse: true,
      autoFitting: false,
      depth: 1,
      unwatchCurrentAlertRow: null,
      unwatchModelFile: null,
      debug: 'none' // 'none' or 'block' to appear debug container
    }
  },
  computed: {
    ...mapGetters(['currentAlertRow', 'modelFile'])
  },
  mounted () {
    console.log('[nested] mounted')
    const svgWidth = window.innerWidth * 0.95
    const svgHeight = window.innerHeight * 0.8
    this.visualizer = new NestedGraphVisualizer(svgWidth, svgHeight)
    this.visualizer.setUISideNodeClickHook(this.nodeClickCallback)
    this.drawJsonModel()

    this.unwatchCurrentAlertRow = this.$store.watch(
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
    this.unwatchCurrentAlertRow()
    this.unwatchModelFile()
  },
  methods: {
    ...mapMutations(['setAlertHost']),
    saveLayout () {
      this.visualizer.saveLayout(this.modelFile, this.reverse, this.depth)
    },
    nodeClickCallback (nodeData) {
      // re-construct path with layer-name and name attribute,
      // because path has deep-copy identifier (::N).
      const path = [nodeData.path.split('__').shift(), nodeData.name].join('__')
      this.setAlertHost(path)
    },
    drawJsonModel () {
      if (!this.modelFile) {
        return
      }
      this.visualizer.drawJsonModel(
        this.modelFile,
        this.currentAlertRow,
        this.reverse,
        this.depth,
        this.currentAlertRow && this.currentAlertRow.layer, // from AlertHost Input (layer__node)
        this.autoFitting
      )
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
  }
}
</script>

<style lang="scss" scoped>
</style>
