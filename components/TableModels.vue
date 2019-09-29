<template>
  <v-row>
    <v-col v-if="validVisualizer">
      <v-list>
        <v-subheader>
          Models
          <template v-if="visualizer">
            with {{ visualizer }} visualizer
          </template>
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
      <NotFound>Unknown visualizer: {{ visualizer }}</NotFound>
    </v-col>
  </v-row>
</template>

<script>
import { mapState } from 'vuex'
import NotFound from './/NotFound'

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
    ...mapState(['modelFiles', 'visualizers']),
    validVisualizer() {
      if (!this.visualizer) {
        return true
      }
      return this.visualizers.find(v => v.value === this.visualizer)
    },
    modelData() {
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
