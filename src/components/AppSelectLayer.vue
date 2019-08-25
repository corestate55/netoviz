<template>
  <el-checkbox-group
    v-model="selectedLayers"
    size="small"
  >
    <el-checkbox-button
      v-for="layer in wholeLayers"
      v-bind:key="layer"
      border
      v-bind:label="layer"
    >
      {{ layer }}
    </el-checkbox-button>
  </el-checkbox-group>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters(['wholeLayers', 'visualizer']),
    selectedLayers: {
      get () { return this.$store.getters.selectedLayers },
      set (value) { this.$store.commit('setSelectedLayers', value) }
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
