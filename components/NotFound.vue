<template>
  <div class="ma-6">
    <h1>Model and/or Visualizer Not Found</h1>
    <p>
      You can see all of Models/Visualizers available in this application at
      <router-link to="/"> index page. </router-link>
    </p>
    <v-alert type="error" text prominent>
      <slot> Unknown path: {{ $route.path }} </slot>
    </v-alert>
  </div>
</template>

<script>
export default {
  name: 'NotFound'
}
</script>

<style scoped></style>
