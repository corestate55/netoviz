<template>
  <v-app id="app">
    <v-app-bar
      app
      dark
    >
      <v-toolbar-title>Netoviz</v-toolbar-title>
      <div class="flex-grow-1" />
      <v-toolbar-items>
        <AppSelectModel />
        <AppSelectVisualizer />
        <AppBarLinkSource />
      </v-toolbar-items>
    </v-app-bar>

    <v-content>
      <v-container fluid>
        <AlertTable />
        <VisualizeDiagram />
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import AppBarLinkSource from './components/AppBarLinkSource'
import AppSelectModel from './components/AppSelectModel'
import AppSelectVisualizer from './components/AppSelectVisualizer'
import AlertTable from './components/AlertTable'
import VisualizeDiagram from './components/VisualizeDiagram'

export default {
  name: 'App',
  components: {
    AppBarLinkSource,
    AppSelectModel,
    AppSelectVisualizer,
    AlertTable,
    VisualizeDiagram
  }
}
</script>

<style lang="scss">
svg {
  border: solid 1px;
  margin: 10px;
}
</style>
