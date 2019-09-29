export const state = () => ({
  currentAlertRow: { id: -1 },
  alertHost: ''
})

export const mutations = {
  setCurrentAlertRow(state, payload) {
    state.currentAlertRow = payload
  },
  setAlertHost(state, payload) {
    state.alertHost = payload
  }
}
