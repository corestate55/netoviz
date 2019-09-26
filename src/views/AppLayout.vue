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
        <v-row>
          <v-col
            cols="12"
            lg="4"
          >
            <AlertTable />
          </v-col>
          <v-col
            cols="12"
            lg="8"
          >
            <router-view />
          </v-col>
        </v-row>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import AppBarLinkSource from '../components/AppBarLinkSource'
import AppMenuModels from '../components/AppMenuModels'
import AppMenuVisualizers from '../components/AppMenuVisualizers'
import AlertTable from '../components/AlertTable'

export default {
  name: 'AppLayout',
  components: {
    AppBarLinkSource,
    AppMenuModels,
    AppMenuVisualizers,
    AlertTable
  }
}
</script>

<style scoped></style>
