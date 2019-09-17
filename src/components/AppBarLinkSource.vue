<template>
  <v-tooltip bottom>
    <template v-slot:activator="{ on }">
      <v-btn
        icon
        href="https://github.com/corestate55/netoviz"
        target="_blank"
        v-on="on"
      >
        <v-icon>mdi-code-tags</v-icon>
      </v-btn>
    </template>
    <span>Source</span>
  </v-tooltip>
</template>

<script></script>

<style scoped></style>
