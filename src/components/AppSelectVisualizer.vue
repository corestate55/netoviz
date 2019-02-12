<template>
  <div id="visualizer-selector">
    <el-radio-group
      v-model="visualizer"
      size="small"
    >
      <el-radio
        border
        label="Topology"
      />
      <el-radio
        border
        label="Dependency"
      />
    </el-radio-group>
  </div>
</template>

<script>
export default {
  computed: {
    visualizer: {
      get () { return this.$store.getters.visualizer },
      set (value) { this.$store.commit('setVisualizer', value) }
    }
  }
}
</script>

<style lang="scss" scoped>
.el-radio {
  margin: 0;
}
</style>
