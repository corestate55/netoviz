import grpcClient from '../lib/grpc-client'

export const state = () => ({
  modelFiles: [],
  visualizers: Object.freeze([
    {
      text: 'Force-simulation',
      value: 'forceSimulation',
      label: 'Force-simulation diagram per layer.'
    },
    {
      text: 'Dependency',
      value: 'dependency',
      label: 'Dependency diagram.'
    },
    {
      text: 'Dependency2',
      value: 'dependency2',
      label: 'Dependency(v2) diagram.'
    },
    {
      text: 'Nested',
      value: 'nested',
      label: 'Nested diagram.'
    },
    {
      text: 'Distance',
      value: 'distance',
      label: 'Distance diagram.'
    }
  ])
})

export const mutations = {
  setModelFiles(state, payload) {
    state.modelFiles = payload
  }
}

export const actions = {
  async updateModelFiles({ commit }) {
    try {
      if (process.env.NODE_ENV === 'development') {
        const response = await grpcClient.getModels()
        const modelFiles = JSON.parse(response.getJson())
        commit('setModelFiles', Object.freeze(modelFiles))
      } else {
        const response = await fetch('/api/models')
        const modelFiles = await response.json()
        commit('setModelFiles', Object.freeze(modelFiles))
      }
    } catch (error) {
      console.log('[SelectModel] Cannot get models data: ', error)
    }
  }
}
