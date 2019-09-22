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

<style></style>
