<template>
  <TableModels v-bind:visualizer="visualizer" />
</template>

<script>
import TableModels from '~/components/TableModels'

export default {
  components: {
    TableModels
  },
  computed: {
    visualizer() {
      return this.$nuxt.$route.params.visualizer
    }
  }
}
</script>

<style scoped></style>
