<template>
  <v-row>
    <v-col>
      <v-list>
        <v-subheader>About Netoviz</v-subheader>
        <v-list-item-group>
          <v-list-item
            v-for="(item, index) in items"
            v-bind:key="index"
            v-bind:href="item.link"
            target="_blank"
          >
            <v-list-item-icon>
              <v-icon v-text="item.icon" />
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title v-text="item.text" />
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-col>
  </v-row>
</template>

<script>
export default {
  data () {
    return {
      items: [
        {
          icon: 'mdi-code-tags',
          text: 'Github repository',
          link: 'https://github.com/corestate55/netoviz'
        }
      ]
    }
  }
}
</script>

<style scoped></style>
