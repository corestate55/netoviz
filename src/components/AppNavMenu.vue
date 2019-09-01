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
      modelFile: {{ modelFile }},
      visualizer: {{ visualizer }}
    </div>
  </div>
</template>
<script>
export default {
  data () {
    return {
      models: [
        {
          file: 'bf_trial.json',
          label: 'batfish trial'
        },
        {
          file: 'target3b.json',
          label: '[3b] L2 Aggr, L3.5 and L2 separate'
        },
        {
          file: 'target3a.json',
          label: '[3a] L2 Aggr and L3.5'
        },
        {
          file: 'target3.json',
          label: '[3] L2 Aggregated Model'
        },
        {
          file: 'target2.json',
          label: '[2] L2 Compact Model'
        },
        {
          file: 'target.json',
          label: '[1] L2 Verbose Model'
        },
        {
          file: 'diff_test.json',
          label: 'diff viewer test data'
        },
        {
          file: 'target3.diff.json',
          label: 'target3 diff data'
        }
      ],
      visualizers: [
        'Topology',
        'Dependency',
        'Dependency2',
        'Nested'
      ],
      debug: 'none' // 'none' or 'block' to appear debug container
    }
  },
  computed: {
    visualizer: {
      get () { return this.$store.getters.visualizer },
      set (value) { this.$store.commit('setVisualizer', value) }
    },
    modelFile: {
      get () { return this.$store.getters.modelFile },
      set (value) { this.$store.dispatch('updateModelFile', value) }
    }
  },
  mounted () {
    // default
    this.modelFile = this.models[0].file
  },
  methods: {
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

<style lang="scss" scoped>
</style>
