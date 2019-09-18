<template>
  <v-menu
    open-on-hover
    offset-y
  >
    <template v-slot:activator="{ on }">
      <v-btn v-on="on">
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
        v-bind:to="`/target/${modelFile.file}`"
      >
        {{ modelFile.label }}
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  computed: {
    ...mapGetters(['modelFiles'])
  },
  mounted () {
    this.updateModelFiles()
  },
  methods: {
    ...mapActions(['updateModelFiles'])
  }
}
</script>

<style scoped></style>
