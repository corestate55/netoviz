<template>
  <div id="visualizer-container">
    <div
      id="visualizer-state-debug"
      v-bind:style="{ display: debug }"
    >
      <p>
        Visualizer Component (UI Debug)
      </p>
      <ul>
        <li>
          Visualizer = {{ visualizer }}
        </li>
        <li>
          Model File = {{ modelFile }}
        </li>
        <ul>
          <li
            v-for="layer in selectedLayers"
            v-bind:key="layer"
          >
            {{ layer }}
          </li>
        </ul>
      </ul>
    </div>
    <VisualizeDiagramTopology
      v-if="visualizer === 'Topology'"
    />
    <VisualizeDiagramDependency
      v-else-if="visualizer === 'Dependency'"
    />
    <VisualizeDiagramDependency2
      v-else-if="visualizer === 'Dependency2'"
    />
    <VisualizeDiagramNested
      v-else-if="visualizer === 'Nested'"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import VisualizeDiagramTopology from './VisualizeDiagramTopology'
import VisualizeDiagramDependency from './VisualizeDiagramDependency'
import VisualizeDiagramDependency2 from './VisualizeDiagramDependency2'
import VisualizeDiagramNested from './VisualizeDiagramNested'
import '../css/tooltip.scss'

export default {
  components: {
    VisualizeDiagramTopology,
    VisualizeDiagramDependency,
    VisualizeDiagramDependency2,
    VisualizeDiagramNested
  },
  data () {
    return {
      debug: 'none' // 'none' or 'block' to appear debug container
    }
  },
  computed: {
    ...mapGetters(['visualizer', 'modelFile', 'selectedLayers'])
  }
}
</script>

<style lang="scss" scoped>
</style>
