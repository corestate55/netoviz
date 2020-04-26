<template>
  <div>
    <div v-if="debug">
      prop value: {{ value }}, alert host input: {{ alertHostInput }}
    </div>
    <v-text-field
      v-model="alertHostInput"
      clearable
      label="Highlight Host"
      placeholder="node OR layer__node"
      v-on:input="inputAlertHost"
    />
  </div>
</template>

<script>
import { debounce } from 'debounce'

export default {
  props: {
    value: {
      type: String,
      default: '',
      required: true
    }
  },
  data() {
    return {
      alertHostInput: this.value, // copy props (to edit, props value is RO)
      unwatchAlertHost: null,
      debug: false
    }
  },
  computed: {
    currentAlertRow: {
      get() {
        return this.$store.state.alert.currentAlertRow
      },
      set(value) {
        this.$store.commit('alert/setCurrentAlertRow', value)
      }
    }
  },
  watch: {
    value(newValue, _oldValue) {
      this.alertHostInput = newValue
    }
  },
  mounted() {
    this.unwatchAlertHost = this.$store.watch(
      state => state.alert.alertHost,
      (newHost, oldHost) => {
        this.alertHostInput = newHost
        this.inputAlertHost()
      }
    )
  },
  beforeDestroy() {
    this.unwatchAlertHost()
  },
  methods: {
    alertHostInputIsLayerHostFormat() {
      return this.alertHostInput?.match(new RegExp('(.+)__(.+)'))
    },
    alertHostInputIsLayerHostTpFormat() {
      return this.alertHostInput?.match(new RegExp('(.+)__(.+)__(.+)'))
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
      this.$emit('input', this.alertHostInput)
      // set dummy alert to redraw diagram.
      this.currentAlertRow = this.alertFromAlertHostInput()
    }, 500 /* 0.5 sec */)
  }
}
</script>

<style scoped></style>
