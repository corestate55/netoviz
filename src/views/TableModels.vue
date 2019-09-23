<template>
  <v-row>
    <v-col v-if="validVisualizer">
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
    <v-col v-else>
      <NotFound> Unknown visualizer: {{ visualizer }} </NotFound>
    </v-col>
  </v-row>
</template>

<script>
import { mapGetters } from 'vuex'
import NotFound from '../components/NotFound'

export default {
  name: 'TableModels',
  components: {
    NotFound
  },
  props: {
    visualizer: {
      type: String,
      default: '',
      required: false
    }
  },
  computed: {
    ...mapGetters(['modelFiles', 'visualizers']),
    validVisualizer () {
      if (!this.visualizer) {
        return true
      }
      return this.visualizers.find(v => v.value === this.visualizer)
    },
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
