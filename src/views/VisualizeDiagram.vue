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
</template>

<script>
import VisualizeDiagramTopology from '../components/VisualizeDiagramTopology'
import VisualizeDiagramDependency from '../components/VisualizeDiagramDependency'
import VisualizeDiagramDependency2 from '../components/VisualizeDiagramDependency2'
import VisualizeDiagramNested from '../components/VisualizeDiagramNested'
import '../css/tooltip.scss'

export default {
  components: {
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
  data () {
    return {
      debug: false
    }
  }
}
</script>

<style lang="scss" scoped></style>
