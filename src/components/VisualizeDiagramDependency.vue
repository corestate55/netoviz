<template>
  <div>
    <v-row v-if="debug">
      <v-col>
        <div>
          visualize diagram dependency
          <ul>
            <li>Dependency model: {{ modelFile }}</li>
            <li>
              Alert Row:
              {{ currentAlertRow ? currentAlertRow.id : 'NOT selected' }}
            </li>
          </ul>
        </div>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <!-- entry point of d3 graph(s) -->
        <div id="visualizer" />
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import DepGraphVisualizer from '../graph/dependency/visualizer'
import '../css/dependency.scss'

export default {
  props: {
    modelFile: {
      type: String,
      default: '',
      require: true
    }
  },
  data () {
    return {
      visualizer: null,
      unwatchCurrentAlertRow: null,
      unwatchModelFile: null,
      debug: false
    }
  },
  computed: {
    ...mapGetters(['currentAlertRow'])
  },
  mounted () {
    console.log('[dep] mounted')
    const svgWidth = window.innerWidth * 0.95
    const svgHeight = window.innerHeight * 0.8
    this.visualizer = new DepGraphVisualizer(svgWidth, svgHeight)

    this.drawJsonModel()
    // set watcher for alert selection change
    this.unwatchCurrentAlertRow = this.$store.watch(
      state => state.currentAlertRow,
      (newRow, oldRow) => {
        this.drawJsonModel()
        this.highlightByAlert(newRow)
      }
    )
    this.unwatchModelFile = this.$store.watch(
      state => state.modelFile,
      (newModelFile, oldModelFile) => {
        console.log(
          `[dep] modelFile changed from ${oldModelFile} to ${newModelFile}`
        )
        this.clearAllHighlight()
        this.drawJsonModel()
      }
    )
  },
  beforeDestroy () {
    console.log('[dep] before destroy')
    delete this.visualizer
    this.unwatchCurrentAlertRow()
    this.unwatchModelFile()
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
  }
}
</script>

<style lang="scss" scoped></style>
