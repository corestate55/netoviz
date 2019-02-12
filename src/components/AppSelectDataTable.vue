<template>
  <div>
    <table>
      <tr>
        <td class="label">
          Visualizer
        </td>
        <td class="component">
          <AppSelectVisualizer />
        </td>
      </tr>
      <tr>
        <td class="label">
          Topology Data
        </td>
        <td class="component">
          <AppSelectModel />
        </td>
      </tr>
      <tr>
        <td class="label">
          Layer
        </td>
        <td class="component">
          <AppSelectLayer />
        </td>
      </tr>
    </table>
  </div>
</template>

<script>
import AppSelectVisualizer from './AppSelectVisualizer'
import AppSelectModel from './AppSelectModel'
import AppSelectLayer from './AppSelectLayer'

export default {
  components: {
    AppSelectVisualizer,
    AppSelectModel,
    AppSelectLayer
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
