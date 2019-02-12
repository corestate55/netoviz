<template>
  <div id="app">
    <AppTable />
    <AlertTable />
    <Visualizer />
  </div>
</template>

<script>
import AppTable from './components/AppMenu'
import AlertTable from './components/AlertTable'
import Visualizer from './components/Visualizer'

export default {
  name: 'app',
  components: {
    AppTable,
    AlertTable,
    Visualizer
  }
}
</script>

<style lang="scss">
#app {
  margin: 0.5em;
}
</style>
