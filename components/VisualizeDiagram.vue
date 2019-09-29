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
    <template v-if="validVisualizer && validModelFile">
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
    </template>
    <v-row v-else>
      <v-col>
        <NotFound>
          <ul>
            <li v-if="!validVisualizer">
              Unknown visualizer: {{ visualizer }}
            </li>
            <li v-if="!validModelFile">Unknown model file: {{ modelFile }}</li>
          </ul>
        </NotFound>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import NotFound from './NotFound'
import VisualizeDiagramTopology from './VisualizeDiagramTopology'
import VisualizeDiagramDependency from './VisualizeDiagramDependency'
import VisualizeDiagramDependency2 from './VisualizeDiagramDependency2'
import VisualizeDiagramNested from './VisualizeDiagramNested'
import '~/lib/style/tooltip.scss'

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
    ...mapState(['modelFiles', 'visualizers']),
    validVisualizer() {
      return this.visualizers.find(v => v.value === this.visualizer)
    },
    validModelFile() {
      return this.modelFiles.find(m => m.file === this.modelFile)
    }
  }
}
</script>

<style lang="scss" scoped></style>
