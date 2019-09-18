<template>
  <v-row>
    <v-col>
      <v-list>
        <v-subheader>
          Models
          <span
            v-show="visualizer"
          >&nbsp;with {{ visualizer }} visualizer</span>
        </v-subheader>
        <v-list-item-group>
          <v-list-item
            v-for="(mData, index) in modelData"
            v-bind:key="index"
            v-bind:to="mData.link"
          >
            {{ mData.text }}
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-col>
  </v-row>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'TableModels',
  props: {
    visualizer: {
      type: String,
      default: '',
      required: false
    }
  },
  computed: {
    ...mapGetters(['modelFiles']),
    modelData () {
      return this.modelFiles.map(m => ({
        text: m.label,
        link: this.visualizer
          ? `/visualizer/${this.visualizer}/${m.file}`
          : `/target/${m.file}`
      }))
    }
  }
}
</script>

<style scoped></style>
