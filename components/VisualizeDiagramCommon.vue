<template>
  <div id="common-template">
    <!-- Dummy: cannot crete <template> less single file component. -->
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  props: {
    modelFile: {
      type: String,
      default: '',
      require: true
    }
  },
  data() {
    return {
      visualizer: null,
      unwatchCurrentAlertRow: null,
      unwatchModelFile: null
    }
  },
  computed: {
    ...mapState('alert', ['currentAlertRow']),
    isLarge() {
      return !!['lg', 'xl'].find(d => d === this.$vuetify.breakpoint.name)
    },
    svgWidth() {
      const factor = (this.isLarge ? 8 / 12 : 1.0) * 0.95
      return this.$vuetify.breakpoint.width * factor
    },
    svgHeight() {
      const factor = this.isLarge ? 0.9 : 0.8
      return this.$vuetify.breakpoint.height * factor
    }
  },
  watch: {
    $route(newRoute, oldRoute) {
      // watch `params.modelFile` change:
      // because if `modelFile` changed, graph-diagram component will reused
      // (will not be called lifecycle hook).
      // if `params.visualizer` changed, then views/VisualizeDiagram component
      // switches corresponding component and run its lifecycle hook.
      const oldModelFile = oldRoute.params.modelFile
      const newModelFile = newRoute.params.modelFile
      if (oldModelFile !== newModelFile) {
        this.watchModelFile(newModelFile, oldModelFile)
      }
    }
  },
  mounted() {
    // Lifecycle for graph visualizer:
    // merged at including component X.
    // called here before X.mounted()
    console.log('[viz] mounted')
    this.unwatchCurrentAlertRow = this.$store.watch(
      state => state.alert.currentAlertRow,
      this.watchCurrentAlertRow
    )
    this.unwatchModelFile = this.$store.watch(
      state => state.modelFile,
      this.watchModelFile
    )
    this.beforeMakeVisualizer() // hook (to ready make visualizer)
    this.visualizer = this.makeVisualizer(this.svgWidth, this.svgHeight)
    this.afterMakeVisualizer() // hook (to initialize visualizer)
    this.drawJsonModel() // generate initial graph
  },
  beforeDestroy() {
    // Lifecycle for graph visualizer:
    // merged at including component X.
    // called here before X.beforeDestroy()
    console.log('[viz] before destroy')
    this.beforeDeleteVisualizer() // hook
    delete this.visualizer
    this.afterDeleteVisualizer() // hook
    this.unwatchCurrentAlertRow()
    this.unwatchModelFile()
  },
  methods: {
    // Common methods (template):
    // Methods are overwritten at including (mix-in) component
    makeVisualizer(width, height) {
      // return graph visualizer as `this.visualizer`
      console.error('[viz] makeVisualizer must be overwritten.')
    },
    watchCurrentAlertRow(newRow, oldRow) {
      // callback function when currentAlertRow changed.
      // redraw (drawJsonModel)
      // if the graph changes graph objects according to alert-host.
      this.drawJsonModel()
      this.highlightByAlert(newRow)
    },
    watchModelFile(newModelFile, oldModelFile) {
      // callback function when modelFile changed.
      console.log(
        `[viz] modelFile changed from ${oldModelFile} to ${newModelFile}`
      )
      this.clearAllHighlight()
      this.drawJsonModel()
    },
    clearAllHighlight() {
      // function to clear all highlights in graph(s).
      console.error('[viz] clearAllHighlight must be overwritten.')
    },
    beforeMakeVisualizer() {
      // optional: hook in mounted(): to ready make visualizer
    },
    afterMakeVisualizer() {
      // optional: hook in mounted(): to initialize visualizer
    },
    beforeDeleteVisualizer() {
      // optional: hook in beforeDestroy()
    },
    afterDeleteVisualizer() {
      // optional: hook in beforeDestroy()
    },
    drawJsonModel() {
      // function to generate graph using visualizer.
      console.error('[viz] drawJsonModel must be overwrite.')
    },
    highlightByAlert(alertRow) {
      if (alertRow) {
        this.visualizer.highlightByAlert(alertRow)
      } else {
        this.clearAllHighlight()
      }
    },
    resizeSVG() {
      this.visualizer &&
        this.visualizer.resizeSVG(this.svgWidth, this.svgHeight)
    }
  }
}
</script>

<style scoped></style>
