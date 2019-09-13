<template>
  <div>
    <el-menu
      mode="horizontal"
      v-on:select="handleSelect"
    >
      <el-submenu index="model-select">
        <template slot="title">
          Model Data
        </template>
        <el-menu-item
          v-for="model in models"
          v-bind:key="model.file"
          v-bind:index="model.file"
        >
          {{ model.label }}
        </el-menu-item>
      </el-submenu>
      <el-submenu index="visualizer-select">
        <template slot="title">
          Visualizer
        </template>
        <el-menu-item
          v-for="vis in visualizers"
          v-bind:key="vis"
          v-bind:index="vis"
        >
          {{ vis }}
        </el-menu-item>
      </el-submenu>
    </el-menu>
    <div v-bind:style="{ display: debug }">
      modelFile: {{ modelFile }}, visualizer: {{ visualizer }}
    </div>
  </div>
</template>
<script>
export default {
  data () {
    return {
      models: [],
      visualizers: ['Topology', 'Dependency', 'Dependency2', 'Nested'],
      debug: 'none' // 'none' or 'block' to appear debug container
    }
  },
  computed: {
    visualizer: {
      get () {
        return this.$store.getters.visualizer
      },
      set (value) {
        this.$store.commit('setVisualizer', value)
      }
    },
    modelFile: {
      get () {
        return this.$store.getters.modelFile
      },
      set (value) {
        this.$store.dispatch('updateModelFile', value)
      }
    }
  },
  mounted () {
    this.getModels()
  },
  methods: {
    async getModels () {
      try {
        const response = await fetch('/models')
        this.models = await response.json()
        this.modelFile = this.models[0].file // default
      } catch (error) {
        console.log('[NavMenu] Cannot get models data: ', error)
      }
    },
    handleSelect (key, keyPath) {
      if (keyPath[0] === 'model-select') {
        this.modelFile = keyPath[1]
      } else {
        // keyPath[0] === 'visualizer-select'
        this.visualizer = keyPath[1]
      }
    }
  }
}
</script>

<style lang="scss" scoped></style>
