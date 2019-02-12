<template>
  <div id="layer-selector">
    <el-checkbox-group
      v-model="selectedLayers"
      v-bind:disabled="useDependencyGraph"
      size="small"
    >
      <el-checkbox
        border
        v-for="layer in wholeLayers"
        v-bind:label="layer"
        v-bind:key="layer"
      >
        {{ layer }}
      </el-checkbox>
    </el-checkbox-group>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters(['wholeLayers', 'visualizer']),
    useDependencyGraph () {
      return this.visualizer === 'Dependency'
    },
    selectedLayers: {
      get () { return this.$store.getters.selectedLayers },
      set (value) { this.$store.commit('setSelectedLayers', value) }
    }
  }
}
</script>

<style lang="scss" scoped>
.el-checkbox {
  margin: 0;
}
</style>
