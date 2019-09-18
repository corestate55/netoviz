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
        v-bind:to="`/visualizer/${visualizer}`"
      >
        {{ visualizer }}
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
export default {
  data () {
    return {
      visualizers: ['topology', 'dependency', 'dependency2', 'nested']
    }
  }
}
</script>

<style scoped></style>
