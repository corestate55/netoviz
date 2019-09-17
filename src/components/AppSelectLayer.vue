<template>
  <v-select
    v-model="selectedLayers"
    v-bind:items="wholeLayers"
    chips
    multiple
  />
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters(['wholeLayers', 'visualizer']),
    selectedLayers: {
      get () {
        return this.$store.getters.selectedLayers
      },
      set (value) {
        this.$store.commit('setSelectedLayers', value)
      }
    }
  },
  mounted () {
    this.selectedLayers = this.wholeLayers
  }
}
</script>

<style lang="scss" scoped></style>
