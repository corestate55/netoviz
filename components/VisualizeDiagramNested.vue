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
          label="Base depth"
          type="number"
          min="1"
          v-on:input="drawRfcTopologyData()"
        />
      </v-col>
      <v-col>
        <v-btn rounded color="info" v-on:click="saveLayout()">
          Save Layout
        </v-btn>
      </v-col>
    </v-row>
    <v-row v-resize="resizeSVG">
      <v-col>
        <!-- entry point of d3 diagram(s) -->
        <div id="visualizer" />
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapMutations } from 'vuex'
import VisualizeDiagramCommon from './VisualizeDiagramCommon'
import NestedDiagramVisualizer from '~/lib/diagram/nested/visualizer'
import '~/lib/style/nested.scss'

export default {
  mixins: [VisualizeDiagramCommon],
  data() {
    return {
      reverse: true,
      autoFitting: false,
      aggregation: true,
      depth: 1,
      debug: false
    }
  },
  watch: {
    reverse() {
      this.drawRfcTopologyData()
    },
    autoFitting() {
      this.drawRfcTopologyData()
    },
    aggregation() {
      this.drawRfcTopologyData()
    }
  },
  methods: {
    ...mapMutations('alert', ['setAlertHost']),
    makeVisualizer(width, height) {
      return new NestedDiagramVisualizer(width, height)
    },
    clearAllHighlight() {
      this.visualizer.clearAllAlertHighlight()
    },
    afterMakeVisualizer() {
      this.visualizer.setUISideNodeClickHook(this.nodeClickCallback)
    },
    drawRfcTopologyData() {
      this.visualizer.drawRfcTopologyData(
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
