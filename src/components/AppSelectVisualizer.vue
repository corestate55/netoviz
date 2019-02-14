<template>
  <el-radio-group
    v-model="visualizer"
    size="small"
  >
    <el-radio-button
      label="Topology"
    />
    <el-radio-button
      label="Dependency"
    />
  </el-radio-group>
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
</style>
