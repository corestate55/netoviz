<template>
  <div id="visualizer-container">
    <v-row v-if="debug">
      <v-col>
        <div id="visualizer-state-debug">
          <p>
            Visualizer Component (UI Debug)
          </p>
          <ul>
            <li>Visualizer = {{ visualizer }}</li>
            <li>Model File = {{ modelFile }}</li>
          </ul>
        </div>
      </v-col>
    </v-row>
    <div v-if="validVisualizer && validModelFile">
      <VisualizeDiagramTopology
        v-if="visualizer === 'topology'"
        v-bind:model-file="modelFile"
      />
      <VisualizeDiagramDependency
        v-else-if="visualizer === 'dependency'"
        v-bind:model-file="modelFile"
      />
      <VisualizeDiagramDependency2
        v-else-if="visualizer === 'dependency2'"
        v-bind:model-file="modelFile"
      />
      <VisualizeDiagramNested
        v-else-if="visualizer === 'nested'"
        v-bind:model-file="modelFile"
      />
    </div>
    <v-row v-else>
      <v-col>
        <NotFound>
          <ul>
            <li v-show="!validVisualizer">
              Unknown visualizer: {{ visualizer }}
            </li>
            <li v-show="!validModelFile">
              Unknown model file: {{ modelFile }}
            </li>
          </ul>
        </NotFound>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import NotFound from '../components/NotFound'
import VisualizeDiagramTopology from '../components/VisualizeDiagramTopology'
import VisualizeDiagramDependency from '../components/VisualizeDiagramDependency'
import VisualizeDiagramDependency2 from '../components/VisualizeDiagramDependency2'
import VisualizeDiagramNested from '../components/VisualizeDiagramNested'
import '../css/tooltip.scss'

export default {
  components: {
    NotFound,
    VisualizeDiagramTopology,
    VisualizeDiagramDependency,
    VisualizeDiagramDependency2,
    VisualizeDiagramNested
  },
  props: {
    visualizer: {
      type: String,
      default: 'Dependency2',
      require: true
    },
    modelFile: {
      type: String,
      default: '',
      require: true
    }
  },
  data: () => ({ debug: false }),
  computed: {
    ...mapGetters(['modelFiles', 'visualizers']),
    validVisualizer () {
      return this.visualizers.find(v => v.value === this.visualizer)
    },
    validModelFile () {
      return this.modelFiles.find(m => m.file === this.modelFile)
    }
  }
}
</script>

<style lang="scss" scoped></style>
