<template>
  <div id="app">
    <table>
      <tr>
        <td class="label">Visualizer</td>
        <td class="component"><VisualizerSelector /></td>
      </tr>
      <tr>
        <td class="label">Topology Data</td>
        <td class="component"><ModelSelector /></td>
      </tr>
      <tr>
        <td class="label">Layer</td>
        <td class="component"><LayerSelector /></td>
      </tr>
    </table>
    <Visualizer />
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
  input.el-input__inner {
    width: 30em;
  }
  td {
    &.label {
      text-align: right;
      font-weight: bold;
    }
    &.component {
      padding: 5px;
      white-space: nowrap;
      label {
        margin: 0px;
      }
    }
  }
</style>
