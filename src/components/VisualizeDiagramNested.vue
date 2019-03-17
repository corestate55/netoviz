<template>
  <div id="visualizer">
    <div
      v-bind:style="{ display: debug }"
    >
      Nested model: {{ modelFile }}
      Alert Row: {{ currentAlertRow ? currentAlertRow.id : 'NOT selected' }}
    </div>
    <!-- entry point of d3 graph(s) -->
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import NestedGraphVisualizer from '../graph/nested/visualizer'
import '../css/nested.scss'

export default {
  name: 'VisualizeDiagramNested.vue',
  data () {
    return {
      visualizer: null,
      unwatchModelFile: null,
      debug: 'block' // 'none' or 'block' to appear debug container
    }
  },
  computed: {
    ...mapGetters(['currentAlertRow', 'modelFile'])
  },
  methods: {
    drawJsonModel () {
      if (this.modelFile) {
        this.visualizer.drawJsonModel(this.modelFile, this.currentAlertRow)
      }
    }
  },
  mounted () {
    console.log('[nested] mounted')
    this.visualizer = new NestedGraphVisualizer()
    this.drawJsonModel()

    this.unwatchModelFile = this.$store.watch(
      state => state.modelFile,
      (newModelFile, oldModelFile) => {
        console.log(`[nested] modelFile changed from ${oldModelFile} to ${newModelFile}`)
        this.drawJsonModel()
      }
    )
  },
  beforeDestroy () {
    console.log('[nested] before destroy')
    this.unwatchModelFile()
  }
}
</script>

<style lang="scss" scoped>
</style>
