<template>
  <v-menu open-on-hover offset-y>
    <template v-slot:activator="{ on }">
      <v-btn elevation="0" v-on="on">
        Models
        <v-icon right>
          mdi-menu-down
        </v-icon>
      </v-btn>
    </template>
    <v-list>
      <v-list-item
        v-for="(modelFile, index) in modelFiles"
        v-bind:key="index"
        v-bind:to="selectRoute(modelFile.file)"
      >
        {{ modelFile.label }}
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  computed: {
    ...mapState(['modelFiles'])
  },
  mounted() {
    this.updateModelFiles()
  },
  methods: {
    ...mapActions(['updateModelFiles']),
    selectRoute(modelFile) {
      if (this.$route.path.match(new RegExp('/target/.*/.*'))) {
        const visualizer = this.$route.params.visualizer
        return `/target/${modelFile}/${visualizer}`
      } else if (this.$route.path.match(new RegExp('/visualizer/.*'))) {
        const visualizer = this.$route.params.visualizer
        return `/visualizer/${visualizer}/${modelFile}`
      }
      return `/target/${modelFile}`
    }
  }
}
</script>

<style scoped></style>
