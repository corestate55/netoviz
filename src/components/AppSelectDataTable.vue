<template>
  <div>
    <el-row>
      <el-col v-bind:span="3">
        <div class="item">Visualizer</div>
      </el-col>
      <el-col v-bind:span="12">
        <AppSelectVisualizer />
      </el-col>
    </el-row>
    <el-row>
      <el-col v-bind:span="3">
        <div class="item">Topology Data</div>
      </el-col>
      <el-col v-bind:span="12">
        <AppSelectModel />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import AppSelectVisualizer from './AppSelectVisualizer'
import AppSelectModel from './AppSelectModel'

export default {
  components: {
    AppSelectVisualizer,
    AppSelectModel
  }
}
</script>

<style lang="scss" scoped>
.el-row {
  margin: 10px 0;
}
div.item {
  padding: 0.2em 1em;
  text-align: right;
}
</style>
