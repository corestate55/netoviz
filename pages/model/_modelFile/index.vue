<template>
  <TableVisualizers v-bind:model-file="modelFile" />
</template>

<script>
import TableVisualizers from '~/components/TableVisualizers'

export default {
  components: {
    TableVisualizers
  },
  computed: {
    modelFile() {
      return this.$nuxt.$route.params.modelFile
    }
  }
}
</script>

<style scoped></style>
