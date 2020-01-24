export const state = () => ({
  modelFiles: [],
  visualizers: [
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
    }
  ]
})

export const mutations = {
  setModelFiles(state, payload) {
    state.modelFiles = payload
  }
}

export const actions = {
  async updateModelFiles({ commit }) {
    try {
      const response = await fetch('/api/models')
      const modelFiles = await response.json()
      commit('setModelFiles', modelFiles)
    } catch (error) {
      console.log('[SelectModel] Cannot get models data: ', error)
    }
  }
}
