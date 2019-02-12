<template>
  <div>
    <table>
      <tr>
        <td class="label">Visualizer</td>
        <td class="component">
          <VisualizerSelector />
        </td>
      </tr>
      <tr>
        <td class="label">Topology Data</td>
        <td class="component">
          <ModelSelector />
        </td>
      </tr>
      <tr>
        <td class="label">Layer</td>
        <td class="component">
          <LayerSelector />
        </td>
      </tr>
    </table>
  </div>
</template>

<script>
import VisualizerSelector from './VisualizerSelector'
import ModelSelector from './ModelSelector'
import LayerSelector from './LayerSelector'

export default {
  components: {
    VisualizerSelector,
    ModelSelector,
    LayerSelector
  }
}
</script>

<style lang="scss" scoped>
td {
  &.label {
    text-align: right;
    font-weight: bold;
  }
  &.component {
    padding: 5px;
    white-space: nowrap;
    label {
      margin: 0;
    }
  }
}
</style>
