<template>
  <TableModels />
</template>

<script>
import TableModels from '~/components/TableModels'

export default {
  components: {
    TableModels
  },
  head: () => ({ title: 'Model List' })
}
</script>

<style scoped></style>
