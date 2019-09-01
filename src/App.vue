<template>
  <div id="app">
    <AppNavMenu />
    <AlertTable />
    <VisualizeDiagram />
  </div>
</template>

<script>
import AppNavMenu from './components/AppNavMenu'
import AlertTable from './components/AlertTable'
import VisualizeDiagram from './components/VisualizeDiagram'

export default {
  name: 'App',
  components: {
    AppNavMenu,
    AlertTable,
    VisualizeDiagram
  }
}
</script>

<style lang="scss">
#app {
  margin: 0.5em;
}
body {
  font-size: 10pt;
  color: #333;
}

svg {
  border: solid 1px;
  margin: 10px;
}
</style>
