<template>
  <div id="visualizer-selector">
    <el-radio-group v-model="visualizer" size="medium">
      <el-radio-button label="Topology"></el-radio-button>
      <el-radio-button label="Dependency" ></el-radio-button>
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
</style>
