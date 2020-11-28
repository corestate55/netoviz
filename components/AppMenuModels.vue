<template>
  <v-menu open-on-hover offset-y>
    <template v-slot:activator="{ on }">
      <v-btn elevation="0" v-on="on">
        Models
        <v-icon right> mdi-menu-down </v-icon>
      </v-btn>
    </template>
    <v-list>
      <v-list-item
        v-for="(modelFile, index) in modelFiles"
        v-bind:key="index"
        v-bind:to="selectRoute(modelFile.file)"
      >
        {{ modelFile.label }}
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import grpcClient from '../lib/grpc-client'
import AppAPICommon from './AppAPICommon'

export default {
  mixins: [AppAPICommon],
  computed: {
    ...mapState(['modelFiles'])
  },
  mounted() {
    this.updateModelFiles()
  },
  methods: {
    ...mapMutations(['setModelFiles']),
    async updateModelFiles() {
      try {
        if (this.apiParam.use === 'grpc') {
          const response = await grpcClient(
            this.apiParam.grpcURIBase
          ).getModels()
          const modelFiles = JSON.parse(response.getJson())
          this.setModelFiles(Object.freeze(modelFiles))
        } else {
          const response = await fetch(
            this.apiParam.restURIBase + '/api/models'
          )
          const modelFiles = await response.json()
          this.setModelFiles(Object.freeze(modelFiles))
        }
      } catch (error) {
        console.log('[SelectModel] Cannot get models data: ', error)
      }
    },
    selectRoute(modelFile) {
      if (this.$route.path.match(/\/model\/.*\/.*/)) {
        const visualizer = this.$route.params.visualizer
        return `/model/${modelFile}/${visualizer}`
      } else if (this.$route.path.match(/\/visualizer\/.*/)) {
        const visualizer = this.$route.params.visualizer
        return `/visualizer/${visualizer}/${modelFile}`
      }
      return `/model/${modelFile}`
    }
  }
}
</script>

<style scoped></style>
