<template>
  <div id="layer-selector">
    <el-checkbox-group v-model="selectedLayers" size="medium">
      <el-checkbox-button v-for="layer in wholeLayers" :label="layer" :key="layer">
        {{layer}}
      </el-checkbox-button>
    </el-checkbox-group>
  </div>
</template>

<script>
export default {
  computed: {
    wholeLayers: {
      get () { return this.$store.getters.wholeLayers },
      set (value) { this.$store.commit('setWholeLayers', value) }
    },
    selectedLayers: {
      get () { return this.$store.getters.selectedLayers },
      set (value) { this.$store.commit('setSelectedLayers', value) }
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
