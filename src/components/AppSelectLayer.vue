<template>
  <el-checkbox-group
    v-model="selectedLayers"
    v-bind:disabled="useSingleDiagram"
    size="small"
  >
    <el-checkbox-button
      border
      v-for="layer in wholeLayers"
      v-bind:label="layer"
      v-bind:key="layer"
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
    useSingleDiagram () {
      return this.visualizer === 'Dependency' || this.visualizer === 'Nested'
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
