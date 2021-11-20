<template>
  <v-app id="app">
    <v-app-bar app dense dark>
      <v-toolbar-title>Netoviz</v-toolbar-title>
      <div class="flex-grow-1" />
      <v-toolbar-items>
        <AppMenuModels />
        <AppMenuVisualizers />
        <AppBarLinkSource />
      </v-toolbar-items>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <v-row>
          <v-col><AppBreadcrumbs v-bind:path="$nuxt.$route.path" /></v-col>
          <v-col><TableAlerts /></v-col>
        </v-row>
        <v-row>
          <nuxt />
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import AppBarLinkSource from '~/components/AppBarLinkSource'
import AppMenuModels from '~/components/AppMenuModels'
import AppMenuVisualizers from '~/components/AppMenuVisualizers'
import AppBreadcrumbs from '~/components/AppBreadcrumbs'
const TableAlerts = () => ({
  component: import('~/components/TableAlerts')
})

export default {
  components: {
    AppBarLinkSource,
    AppMenuModels,
    AppMenuVisualizers,
    AppBreadcrumbs,
    TableAlerts
  }
}
</script>

<style scoped></style>
