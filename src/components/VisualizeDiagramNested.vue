<template>
  <div>
    <v-row v-if="debug">
      <v-col>
        <div>
          visualize diagram nested
          <ul>
            <li>Nested model: {{ modelFile }}</li>
            <li>
              Alert Row:
              {{ currentAlertRow ? currentAlertRow.id : 'NOT selected' }}
            </li>
            <li>Reverse? : {{ reverse }} Auto Fitting? : {{ autoFitting }}</li>
          </ul>
        </div>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-switch
          v-model="reverse"
          inset
          label="Bottom View"
        />
      </v-col>
      <v-col>
        <v-switch
          v-model="autoFitting"
          inset
          label="Fit Auto"
        />
      </v-col>
      <v-col>
        <v-text-field
          v-model="depth"
          label="Base depth"
          type="number"
          min="1"
          v-on:input="drawJsonModel()"
        />
      </v-col>
      <v-col>
        <v-btn
          rounded
          color="info"
          v-on:click="saveLayout()"
        >
          Save Layout
        </v-btn>
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
import { mapGetters, mapMutations } from 'vuex'
import NestedGraphVisualizer from '../graph/nested/visualizer'
import '../css/nested.scss'

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
      reverse: true,
      autoFitting: false,
      depth: 1,
      unwatchCurrentAlertRow: null,
      unwatchModelFile: null,
      debug: false
    }
  },
  computed: {
    ...mapGetters(['currentAlertRow'])
  },
  watch: {
    reverse () {
      this.drawJsonModel()
    },
    autoFitting () {
      this.drawJsonModel()
    }
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
        console.log(
          `[nested] modelFile changed from ${oldModelFile} to ${newModelFile}`
        )
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
.nested-view-control {
  background-color: transparent; // change some color to check layout
}
</style>
