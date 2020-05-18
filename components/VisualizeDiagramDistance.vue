<template>
  <div>
    <v-row v-if="debug">
      <v-col>
        <div>
          visualize distance
          <ul>
            <li>Model File: {{ modelFile }}</li>
            <li>Alert Host: {{ alertHost }}</li>
          </ul>
        </div>
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
import DistanceDiagramVisualizer from '../lib/diagram/distance/visualizer'
import AppAPICommon from './AppAPICommon'
import VisualizeDiagramCommon from './VisualizeDiagramCommon'
import '~/lib/style/distance.scss'

export default {
  mixins: [AppAPICommon, VisualizeDiagramCommon],
  data: () => ({
    visualizerName: 'distance',
    debug: false
  }),
  methods: {
    ...mapMutations('alert', ['setAlertHost']),
    makeVisualizer() {
      return new DistanceDiagramVisualizer(
        this.apiParam,
        this.svgWidth,
        this.svgHeight
      )
    },
    clearAllHighlight() {
      this.visualizer.clearHighlight()
    },
    afterMakeVisualizer() {
      this.visualizer.setUISideNodeClickHook(this.nodeClickCallback)
    },
    drawRfcTopologyData() {
      const params = {
        modelFile: this.modelFile,
        alertHost: this.alertHost
      }
      this.visualizer.drawRfcTopologyData(params)
    }
  }
}
</script>

<style lang="scss" scoped></style>
