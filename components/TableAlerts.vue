<template>
  <div>
    <!-- 'value' prop: open all panels at default -->
    <v-expansion-panels v-bind:value="[0]" accordion focusable multiple>
      <v-expansion-panel>
        <v-expansion-panel-header>
          Alert Table
          <span class="text--secondary text-right pr-4">
            Log updated:
            <span class="setting">{{
              alertUpdatedTime && alertUpdatedTime.toLocaleString()
            }}</span>
            Timer:
            <span class="setting">{{ enableTimer ? 'ON' : 'OFF' }}</span>
            Interval:
            <span class="setting">{{ alertPollingInterval }}</span> sec
          </span>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-row>
            <v-col cols="6" md="3" lg="6">
              <v-text-field
                v-model="alertHostInput"
                clearable
                label="Highlight Host"
                placeholder="node OR layer__node"
                v-on:input="inputAlertHost"
              />
            </v-col>
            <v-col cols="6" md="3" lg="6">
              <v-switch v-model="enableTimer" inset label="Alert Polling" />
            </v-col>
            <v-col cols="6" md="3" lg="6">
              <v-text-field
                v-model="alertPollingInterval"
                label="Polling Interval (sec)"
                type="number"
                min="1"
                v-on:change="resetAlertCheckTimer"
              />
            </v-col>
            <v-col cols="6" md="3" lg="6">
              <v-text-field
                v-model="alertLimit"
                label="Polling Logs"
                type="number"
                min="1"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <client-only>
                <v-data-table
                  v-bind:headers="alertTableHeader"
                  v-bind:items="alerts"
                  v-bind:items-per-page="5"
                  dense
                >
                  <template v-slot:item="{ item, headers }">
                    <tr
                      v-bind:class="{
                        'info font-weight-bold white--text':
                          item.id === currentAlertRow.id
                      }"
                      v-on:click="setAlertTableCurrentRow(item)"
                    >
                      <td v-for="(header, index) in headers" v-bind:key="index">
                        <v-chip
                          v-if="header.value === 'severity'"
                          v-bind:color="severityColor('fill', item.severity)"
                          v-bind:text-color="
                            severityColor('text', item.severity)
                          "
                        >
                          {{ item.severity }}
                        </v-chip>
                        <template v-else>
                          {{ item[header.value] }}
                        </template>
                      </td>
                    </tr>
                  </template>
                </v-data-table>
              </client-only>
            </v-col>
          </v-row>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
    <v-row v-if="debug">
      <v-col>
        <div>
          <ul>
            <li>alert host input: {{ alertHostInput }}</li>
            <li>alert host store: {{ alertHost }}</li>
            <li>enable polling?: {{ enableTimer }}</li>
            <li>polling interval: {{ alertPollingInterval }}</li>
            <li>current alert row: {{ currentAlertRow }}</li>
          </ul>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { debounce } from 'debounce'
import AppAPICommon from './AppAPICommon'
import { getAlertsViaREST, getAlertsViaGRPC, severityColor } from '~/lib/alerts'

export default {
  mixins: [AppAPICommon],
  data() {
    return {
      alerts: [],
      alertLimit: 15, // default: fetch 15 rows (per polling)
      alertPollingInterval: 10, // default: 10sec
      alertCheckTimer: null,
      alertUpdatedTime: null,
      alertHostInput: '', // local state of alertHost
      currentAlertRow: { id: -1 },
      alertTableHeader: Object.freeze([
        { text: 'ID', sortable: true, value: 'id' },
        { text: 'Severity', sortable: true, value: 'severity' },
        { text: 'Host', sortable: true, value: 'host' },
        { text: 'Message', sortable: true, value: 'message' },
        { text: 'Date', sortable: true, value: 'date' }
      ]),
      fromAlertHostInput: false,
      enableTimer: false,
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
  watch: {
    enableTimer() {
      this.setAlertCheckTimer()
    }
  },
  mounted() {
    this.updateAlerts() // initial data
    this.setAlertCheckTimer()
    this.unwatchAlertHost = this.$store.watch(
      state => state.alert.alertHost,
      (newValue, oldValue) => {
        this.alertHostInput = newValue
      }
    )
  },
  beforeDestroy() {
    this.stopAlertCheckTimer()
  },
  methods: {
    setAlertCheckTimer() {
      this.enableTimer
        ? this.startAlertCheckTimer()
        : this.stopAlertCheckTimer()
    },
    resetAlertCheckTimer() {
      this.stopAlertCheckTimer()
      this.setAlertCheckTimer()
    },
    stopAlertCheckTimer() {
      clearInterval(this.alertCheckTimer)
      this.alertCheckTimer = null
    },
    startAlertCheckTimer() {
      this.alertCheckTimer = setInterval(() => {
        this.updateAlerts()
      }, this.alertPollingInterval * 1000) // sec
    },
    async getAlertsFromServer() {
      try {
        if (this.apiParam.use === 'grpc') {
          return await getAlertsViaGRPC(this.apiParam, this.alertLimit)
        } else {
          return await getAlertsViaREST(this.apiParam, this.alertLimit)
        }
      } catch (error) {
        console.error('[getAlertsFromServer] get alerts failed: ', error)
        throw error
      }
    },
    async updateAlerts() {
      // update alerts and select head data
      // console.log('updateAlerts: ', new Date())
      const newAlerts = await this.getAlertsFromServer()
      this.alertUpdatedTime = new Date()
      if (!newAlerts || newAlerts.length < 1) {
        return
      }

      // when change alertLimit OR logs updated
      if (
        this.alerts.length !== newAlerts.length ||
        newAlerts[0].id !== this.alerts[0].id
      ) {
        this.alerts = newAlerts
      }
      this.setAlertTableCurrentRow(this.alerts[0])
    },
    setAlertTableCurrentRow(row) {
      // update alertHostInput (text-box)
      this.alertHostInput = row.host || ''
      // update store (NOTICE: fire alertHost store watcher)
      this.alertHost = this.alertHostInput
      // update selected row in alert table
      this.currentAlertRow = row
    },
    severityColor(prop, severity) {
      // delegate: color table search
      return severityColor(prop, severity)
    },
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
      // set dummy alert to redraw diagram.
      this.currentAlertRow = this.alertFromAlertHostInput()
    }, 500 /* 0.5 sec */)
  }
}
</script>

<style lang="scss" scoped>
.setting {
  background-color: #fff9c4;
}
</style>
