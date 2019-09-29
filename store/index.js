export const state = () => ({
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
