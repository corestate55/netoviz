<template>
  <TableModels v-bind:visualizer="visualizer" />
</template>

<script>
import TableModels from '~/components/TableModels'

export default {
  components: {
    TableModels
  },
  head() {
    const suffix = this.visualizer ? ` for ${this.visualizer} diagram` : ''
    return {
      title: `Model List${suffix}`
    }
  },
  computed: {
    visualizer() {
      return this.$nuxt.$route.params.visualizer
    }
  }
}
</script>

<style scoped></style>
