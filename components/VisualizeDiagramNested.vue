<template>
  <div>
    <v-row v-if="debug">
      <v-col>
        <div>
          visualize diagram nested
          <ul>
            <li>Model File: {{ modelFile }}</li>
            <li>Alert Host: {{ alertHost }}</li>
            <li>Reverse? : {{ reverse }}</li>
            <li>Auto Fitting? : {{ autoFitting }}</li>
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
import AppAPICommon from './AppAPICommon'
import VisualizeDiagramCommon from './VisualizeDiagramCommon'
import NestedDiagramVisualizer from '~/lib/diagram/nested/visualizer'
import '~/lib/style/nested.scss'

export default {
  mixins: [AppAPICommon, VisualizeDiagramCommon],
  data() {
    return {
      reverse: true,
      autoFitting: false,
      aggregation: true,
      depth: 1,
      visualizerName: 'nested',
      debug: false
    }
  },
  watch: {
    reverse() {
      this.drawRfcTopologyData()
    },
    autoFitting() {
      this.autoFitting
        ? this.visualizer.fitGrid() // turn on (adjust grid position in frontend)
        : this.drawRfcTopologyData() // turn off (redraw)
    },
    aggregation() {
      this.drawRfcTopologyData()
    }
  },
  methods: {
    ...mapMutations('alert', ['setAlertHost']),
    makeVisualizer() {
      return new NestedDiagramVisualizer(
        this.apiParam,
        this.svgWidth,
        this.svgHeight
      )
    },
    clearAllHighlight() {
      this.visualizer.clearAllAlertHighlight()
    },
    afterMakeVisualizer() {
      this.visualizer.setUISideNodeClickHook(this.nodeClickCallback)
    },
    drawRfcTopologyData() {
      const params = {
        modelFile: this.modelFile,
        alertHost: this.alertHost,
        reverse: this.reverse,
        depth: this.depth,
        aggregate: this.aggregation,
        fitGrid: this.autoFitting
      }
      this.visualizer.drawRfcTopologyData(params)
    },
    saveLayout() {
      const params = {
        modelFile: this.modelFile,
        reverse: this.reverse
      }
      this.visualizer.saveLayout(params)
    }
  }
}
</script>

<style lang="scss" scoped></style>
