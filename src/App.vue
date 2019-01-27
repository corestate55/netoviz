<template>
  <div id="app">
    <table>
      <tr>
        <td class="label">Visualizer</td>
        <td><VisualizerSelector class="component"></VisualizerSelector></td>
      </tr>
      <tr>
        <td class="label">Topology Data</td>
        <td><ModelSelector class="component"></ModelSelector></td>
      </tr>
      <tr>
        <td class="label">Layer</td>
        <td><LayerSelector class="component"></LayerSelector></td>
      </tr>
    </table>
    <Visualizer class="component"></Visualizer>
  </div>
</template>

<script>
import VisualizerSelector from './components/VisualizerSelector'
import ModelSelector from './components/ModelSelector'
import LayerSelector from './components/LayerSelector'
import Visualizer from './components/Visualizer'

export default {
  name: 'app',
  components: {
    VisualizerSelector,
    ModelSelector,
    LayerSelector,
    Visualizer
  }
}
</script>

<style lang="scss">
  #app {
    margin: 0.5em;
  }
  td.label {
    text-align: right;
    font-weight: bold;
  }
  div.component {
    margin: 5px;
  }
</style>
