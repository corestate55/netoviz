<template>
  <v-row>
    <v-col>
      <v-list>
        <v-subheader>
          Visualizers
          <span v-show="modelFile">&nbsp;for {{ modelFile }}</span>
        </v-subheader>
        <v-list-item-group>
          <v-list-item
            v-for="(vizData, index) in visualizerData"
            v-bind:key="index"
            v-bind:to="vizData.link"
          >
            <v-list-item-content>
              {{ vizData.text }}
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-col>
  </v-row>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'TableVisualizers',
  props: {
    modelFile: {
      type: String,
      default: '',
      required: false
    }
  },
  computed: {
    ...mapGetters(['visualizers']),
    visualizerData () {
      return this.visualizers.map(v => ({
        text: v.text,
        link: this.modelFile
          ? `/target/${this.modelFile}/${v.value}`
          : `/visualizer/${v.value}`
      }))
    }
  }
}
</script>

<style scoped></style>
