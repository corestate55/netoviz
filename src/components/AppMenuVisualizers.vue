<template>
  <v-menu
    open-on-hover
    offset-y
  >
    <template v-slot:activator="{ on }">
      <v-btn v-on="on">
        Visualizers
        <v-icon right>
          mdi-menu-down
        </v-icon>
      </v-btn>
    </template>
    <v-list>
      <v-list-item
        v-for="(visualizer, index) in visualizers"
        v-bind:key="index"
        v-bind:to="`/visualizer/${visualizer.value}`"
      >
        {{ visualizer.text }}
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters(['visualizers'])
  }
}
</script>

<style scoped></style>
