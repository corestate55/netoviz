<template>
  <NotFound>
    <ul>
      <li v-for="(key, index) in Object.keys(error)" v-bind:key="index">
        {{ key }} : {{ error[key] }}
      </li>
    </ul>
  </NotFound>
</template>

<script>
import NotFound from '~/components/NotFound'

export default {
  name: 'Error',
  components: {
    NotFound
  },
  props: {
    error: {
      type: Object,
      default: null,
      required: false
    }
  }
}
</script>

<style scoped></style>
