<template>
  <AppLayout />
</template>

<script>
const AppLayout = () => ({
  component: import(/* webpackChunkName: "page" */ './views/AppLayout')
})
export default {
  name: 'App',
  components: {
    AppLayout
  }
}
</script>

<style lang="scss">
svg {
  border: solid 1px;
  margin: 10px;
}
</style>
