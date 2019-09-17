<template>
  <v-select
    v-model="modelFile"
    dense
    v-bind:items="models"
    item-text="label"
    item-value="file"
    label="Model"
  />
</template>

<script>
export default {
  data () {
    return {
      models: []
    }
  },
  computed: {
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
        console.log('[SelectModel] Cannot get models data: ', error)
      }
    }
  }
}
</script>

<style scoped></style>
