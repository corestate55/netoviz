export const state = () => ({
  alertHost: ''
})

export const mutations = {
  setAlertHost(state, payload) {
    state.alertHost = payload
  }
}
