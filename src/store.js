import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  state: {
    currentAlertRow: { id: -1 },
    alertHost: '',
    modelFiles: [],
    visualizers: [
      {
        text: 'Topology',
        value: 'topology',
        label: 'Force-layout topology graph per layer.'
      },
      {
        text: 'Dependency',
        value: 'dependency',
        label: 'Dependency graph.'
      },
      {
        text: 'Dependency2',
        value: 'dependency2',
        label: 'Dependency graph v2.'
      },
      {
        text: 'Nested',
        value: 'nested',
        label: 'Nested graph.'
      }
    ]
  },
  mutations: {
    setCurrentAlertRow (state, payload) {
      state.currentAlertRow = payload
    },
    setAlertHost (state, payload) {
      state.alertHost = payload
    },
    setModelFiles (state, payload) {
      state.modelFiles = payload
    }
  },
  getters: {
    currentAlertRow (state) {
      return state.currentAlertRow
    },
    alertHost (state) {
      return state.alertHost
    },
    modelFiles (state) {
      return state.modelFiles
    },
    visualizers (state) {
      return state.visualizers
    }
  },
  actions: {
    async updateModelFiles ({ commit }) {
      try {
        const response = await fetch('/models')
        const modelFiles = await response.json()
        commit('setModelFiles', modelFiles)
      } catch (error) {
        console.log('[SelectModel] Cannot get models data: ', error)
      }
    }
  }
})
