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
        <v-switch v-model="reverse" inset label="Bottom View" />
      </v-col>
      <v-col>
        <v-switch v-model="autoFitting" inset label="Fit Auto" />
      </v-col>
      <v-col>
        <v-switch v-model="aggregation" inset label="Aggregate" />
      </v-col>
      <v-col>
        <v-text-field
          v-model="depth"
          v-on:input="drawJsonModel()"
          label="Base depth"
          type="number"
          min="1"
        />
      </v-col>
      <v-col>
        <v-btn v-on:click="saveLayout()" rounded color="info">
          Save Layout
        </v-btn>
      </v-col>
    </v-row>
    <v-row v-resize="resizeSVG">
      <v-col>
        <!-- entry point of d3 graph(s) -->
        <div id="visualizer" />
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapMutations } from 'vuex'
import VisualizeDiagramCommon from './VisualizeDiagramCommon'
import NestedGraphVisualizer from '~/lib/graph/nested/visualizer'
import '~/lib/style/nested.scss'

export default {
  mixins: [VisualizeDiagramCommon],
  data() {
    return {
      reverse: true,
      autoFitting: false,
      aggregation: false,
      depth: 1,
      debug: false
    }
  },
  watch: {
    reverse() {
      this.drawJsonModel()
    },
    autoFitting() {
      this.drawJsonModel()
    },
    aggregation() {
      this.drawJsonModel()
    }
  },
  methods: {
    ...mapMutations('alert', ['setAlertHost']),
    makeVisualizer(width, height) {
      return new NestedGraphVisualizer(width, height)
    },
    clearAllHighlight() {
      this.visualizer.clearAllAlertHighlight()
    },
    afterMakeVisualizer() {
      this.visualizer.setUISideNodeClickHook(this.nodeClickCallback)
    },
    drawJsonModel() {
      this.visualizer.drawJsonModel(
        this.modelFile,
        this.currentAlertRow,
        this.reverse,
        this.depth,
        this.currentAlertRow && this.currentAlertRow.layer, // from AlertHost Input (layer__node)
        this.autoFitting,
        this.aggregation
      )
    },
    saveLayout() {
      this.visualizer.saveLayout(this.modelFile, this.reverse, this.depth)
    },
    nodeClickCallback(nodeData) {
      // re-construct path with layer-name and name attribute,
      // because path has deep-copy identifier (::N).
      const path = [nodeData.path.split('__').shift(), nodeData.name].join('__')
      this.setAlertHost(path)
    }
  }
}
</script>

<style lang="scss" scoped></style>
