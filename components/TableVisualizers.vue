<template>
  <v-row>
    <v-col v-if="validModelFile">
      <v-list>
        <v-subheader>
          Visualizers
          <template v-if="modelFile"> for {{ modelFile }} </template>
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
    <v-col v-else>
      <NotFound>Unknown model file: {{ modelFile }}</NotFound>
    </v-col>
  </v-row>
</template>

<script>
import { mapState } from 'vuex'
import NotFound from './NotFound'

export default {
  name: 'TableVisualizers',
  components: {
    NotFound
  },
  props: {
    modelFile: {
      type: String,
      default: '',
      required: false
    }
  },
  computed: {
    ...mapState(['visualizers', 'modelFiles']),
    validModelFile() {
      if (!this.modelFile) {
        return true
      }
      return this.modelFiles.find((m) => m.file === this.modelFile)
    },
    visualizerData() {
      return this.visualizers.map((v) => ({
        text: v.text,
        link: this.modelFile
          ? `/model/${this.modelFile}/${v.value}`
          : `/visualizer/${v.value}`
      }))
    }
  }
}
</script>

<style scoped></style>
