<template>
  <v-list>
    <v-subheader>About Netoviz</v-subheader>
    <v-list-item-group>
      <v-list-item
        v-for="(link, index) in links"
        v-bind:key="index"
        v-bind:href="link.href"
        target="_blank"
      >
        <v-list-item-icon>
          <v-icon v-text="link.icon" />
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title v-text="link.text" />
        </v-list-item-content>
      </v-list-item>
    </v-list-item-group>
  </v-list>
</template>

<script>
export default {
  data() {
    return {
      links: [
        {
          icon: 'mdi-code-tags',
          text: 'Github repository.',
          href: 'https://github.com/corestate55/netoviz'
        },
        {
          icon: 'mdi-play-circle',
          text: 'Heroku online demo.',
          href: 'http://netoviz.herokuapp.com/'
        }
      ]
    }
  }
}
</script>

<style scoped></style>
