<template>
  <div>
    <v-text-field
      v-model="alertHostInput"
      clearable
      label="Highlight Host"
      placeholder="node OR layer__node"
      v-on:input="inputAlertHost"
    />
    <div v-if="debug">
      <ul>
        <li>alert host input: {{ alertHostInput }}</li>
        <li>alert host store: {{ alertHost }}</li>
      </ul>
    </div>
  </div>
</template>

<script>
import { debounce } from 'debounce'
import AppAPICommon from './AppAPICommon'

export default {
  mixins: [AppAPICommon],
  data() {
    return {
      alertHostInput: '', // local state of alertHost
      unwatchAlertHost: null,
      debug: false
    }
  },
  computed: {
    alertHost: {
      get() {
        return this.$store.state.alert.alertHost
      },
      set(value) {
        this.$store.commit('alert/setAlertHost', value)
      }
    }
  },
  mounted() {
    this.unwatchAlertHost = this.$store.watch(
      (state) => state.alert.alertHost,
      (newValue, oldValue) => {
        this.alertHostInput = newValue
      }
    )
  },
  methods: {
    alertHostInputIsLayerHostFormat() {
      return this.alertHostInput?.match(/(.+)__(.+)/)
    },
    alertHostInputIsLayerHostTpFormat() {
      return this.alertHostInput?.match(/(.+)__(.+)__(.+)/)
    },
    splitAlertHostInput() {
      if (this.alertHostInputIsLayerHostTpFormat()) {
        // [layer, host, tp] for term-point highlighting.
        //   if alertHostInput was 'hostA__tpX', it assumes as
        //   {layer: hostA, host: tpX}. 'A__B' format input is used for
        //   node click drill-down in nested diagram.
        return this.alertHostInput.split('__')
      } else if (this.alertHostInputIsLayerHostFormat()) {
        // [layer, host, ''] for node click drill-down
        return this.alertHostInput.split('__').concat([''])
      }
      return ['', this.alertHostInput, ''] // assume alertHostInput as host.
    },
    alertFromAlertHostInput() {
      const pathElements = this.splitAlertHostInput()
      return {
        id: -1, // clear alert table selection
        message: 'selected directly',
        severity: 'information',
        date: new Date().toISOString(),
        // for click drill-down (nested diagram):
        // there are objects that have same name in another layer.
        // it must identify the object using layer info (by path).
        layer: pathElements[0], // additional prop
        host: pathElements[1],
        tp: pathElements[2] // additional prop
      }
    },
    // NOTICE: do not use arrow-function for debounce.
    inputAlertHost: debounce(function () {
      // avoid null when delete input by text-box [X] button.
      this.alertHostInput = this.alertHostInput || ''
      // update store
      this.alertHost = this.alertHostInput
    }, 500 /* 0.5 sec */)
  }
}
</script>

<style lang="scss" scoped>
.setting {
  background-color: #fff9c4;
}
</style>
