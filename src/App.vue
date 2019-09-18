<template>
  <v-app id="app">
    <v-app-bar
      app
      dense
      dark
    >
      <v-toolbar-title>Netoviz</v-toolbar-title>
      <div class="flex-grow-1" />
      <v-toolbar-items>
        <AppMenuModels />
        <AppMenuVisualizers />
        <AppBarLinkSource />
      </v-toolbar-items>
    </v-app-bar>

    <v-content>
      <v-container fluid>
        <AlertTable />
        <router-view />
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import AppBarLinkSource from './components/AppBarLinkSource'
import AppMenuModels from './components/AppMenuModels'
import AppMenuVisualizers from './components/AppMenuVisualizers'
import AlertTable from './components/AlertTable'

export default {
  name: 'App',
  components: {
    AppBarLinkSource,
    AppMenuModels,
    AppMenuVisualizers,
    AlertTable
  }
}
</script>

<style lang="scss">
svg {
  border: solid 1px;
  margin: 10px;
}
</style>
