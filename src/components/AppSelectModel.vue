<template>
  <div id="model-selector">
    <el-select
      v-model="modelFile"
      size="small"
      placeholder="Select"
    >
      <el-option
        v-for="item in options"
        v-bind:key="item.value"
        v-bind:label="item.label"
        v-bind:value="item.value"
      />
    </el-select>
  </div>
</template>

<script>
export default {
  data () {
    return {
      options: [{
        value: 'bf_trial.json',
        label: 'batfish trial'
      }, {
        value: 'target3b.json',
        label: '[3b] L2 Aggr, L3.5 and L2 separate'
      }, {
        value: 'target3a.json',
        label: '[3a] L2 Aggr and L3.5'
      }, {
        value: 'target3.json',
        label: '[3] L2 Aggregated Model'
      }, {
        value: 'target2.json',
        label: '[2] L2 Compact Model'
      }, {
        value: 'target.json',
        label: '[1] L2 Verbose Model'
      }, {
        value: 'diff_test.json',
        label: 'diff viewer test data'
      }, {
        value: 'target3.diff.json',
        label: 'target3 diff data'
      }]
    }
  },
  computed: {
    modelFile: {
      get () { return this.$store.getters.modelFile },
      set (value) { this.$store.dispatch('updateModelFile', value) }
    }
  },
  mounted () {
    // select head model at first
    this.modelFile = this.options[0].value
  }
}
</script>

<style lang="scss" scoped>
.el-select {
  width: 30em;
}
</style>
