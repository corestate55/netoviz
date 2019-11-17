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
            <v-col cols="6" md="2" lg="6">
              <v-btn
                v-bind:disabled="disableClearSelectionButton"
                v-on:click="clickClearSelectionButton"
                rounded
                color="warning"
              >
                <v-icon left>
                  mdi-notification-clear-all
                </v-icon>
                Clear Selection
              </v-btn>
            </v-col>
            <v-col cols="6" md="3" lg="6">
              <v-text-field
                v-model="alertHostInput"
                v-on:input="inputAlertHost"
                clearable
                label="Highlight Host"
                placeholder="node OR layer__node"
              />
            </v-col>
            <v-col cols="4" md="2" lg="4">
              <v-switch v-model="enableTimer" inset label="Alert Polling" />
            </v-col>
            <v-col cols="4" md="2" lg="4">
              <v-text-field
                v-model="alertPollingInterval"
                v-on:change="resetAlertCheckTimer"
                label="Polling Interval (sec)"
                type="number"
                min="1"
              />
            </v-col>
            <v-col cols="4" md="2" lg="4">
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
                        v-bind:text-color="severityColor('text', item.severity)"
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
import colors from 'vuetify/es5/util/colors'

export default {
  data() {
    return {
      alerts: [],
      alertLimit: 15, // default: fetch 15 rows (per polling)
      alertPollingInterval: 10, // default: 10sec
      alertCheckTimer: null,
      alertUpdatedTime: null,
      alertHostInput: '',
      alertTableHeader: [
        { text: 'ID', sortable: true, value: 'id' },
        { text: 'Severity', sortable: true, value: 'severity' },
        { text: 'Host', sortable: true, value: 'host' },
        { text: 'Message', sortable: true, value: 'message' },
        { text: 'Date', sortable: true, value: 'date' }
      ],
      unwatchAlertHost: null,
      fromAlertHostInput: false,
      enableTimer: false,
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
    },
    alertHost() {
      return this.$store.state.alert.alertHost
    },
    disableClearSelectionButton() {
      return (
        this.currentAlertRow && Object.keys(this.currentAlertRow).length < 1
      )
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
      (newHost, oldHost) => {
        this.alertHostInput = newHost
        this.inputAlertHost()
      }
    )
  },
  beforeDestroy() {
    this.unwatchAlertHost()
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
    async updateAlerts() {
      try {
        // update alerts and select head data
        // console.log('updateAlerts: ', new Date())
        const response = await fetch(`/api/alert/${this.alertLimit}`)
        const newAlerts = await response.json()
        this.alertUpdatedTime = new Date()
        if (!newAlerts || newAlerts.length < 1) {
          return
        }
        if (
          this.alerts.length !== newAlerts.length ||
          newAlerts[0].id !== this.alerts[0].id
        ) {
          this.alerts = newAlerts
        }
        this.setAlertTableCurrentRow(this.alerts[0])
      } catch (error) {
        console.error('[AlertTable] fetch alert failed: ', error)
      }
    },
    clickClearSelectionButton() {
      this.alertHostInput = ''
      this.setAlertTableCurrentRow({ id: -1 })
    },
    alertHostInputIsLayerHostFormat() {
      return (
        this.alertHostInput &&
        this.alertHostInput.match(new RegExp('(.+)__(.+)'))
      )
    },
    layerOfAlertHostInput() {
      return this.alertHostInputIsLayerHostFormat()
        ? this.alertHostInput.split('__').shift()
        : null
    },
    hostOfAlertHostInput() {
      return this.alertHostInputIsLayerHostFormat()
        ? this.alertHostInput.split('__').pop()
        : this.alertHostInput
    },
    alertFromAlertHostInput() {
      return {
        id: -1, // clear alert table selection
        message: 'selected directly',
        severity: 'information',
        date: new Date().toISOString(),
        // for click drill-down (nested diagram):
        // there are objects that have same name in another layer.
        // it must identify the object using layer info (by path).
        layer: this.layerOfAlertHostInput(),
        host: this.hostOfAlertHostInput()
      }
    },
    inputAlertHost: debounce(function() {
      // NOTICE: do not use arrow-function for debounce.
      this.fromAlertHostInput = true
      // set dummy alert to redraw diagram.
      this.setAlertTableCurrentRow(this.alertFromAlertHostInput())
      this.fromAlertHostInput = false
    }, 500), // 0.5sec
    setAlertTableCurrentRow(row) {
      // console.log('[AlertTable] set alert table current row: ', row)
      if (!this.fromAlertHostInput) {
        this.alertHostInput = row && row.host ? row.host : ''
      }
      this.currentAlertRow = row
    },
    severityColor(prop, severity) {
      const colorTable = [
        {
          severity: 'disaster',
          fill: colors.red.lighten1, // bright red
          text: colors.grey.lighten5
        },
        {
          severity: 'high',
          fill: colors.red.darken4, // red
          text: colors.grey.lighten5
        },
        {
          severity: 'average',
          fill: colors.orange.lighten1, // orange
          text: colors.grey.darken4
        },
        {
          severity: 'warning',
          fill: colors.yellow.accent3, // bright yellow
          text: colors.grey.darken4
        },
        {
          severity: 'information',
          fill: colors.lightGreen.darken1, // bright green
          text: colors.grey.lighten5
        }
      ]
      const defaultColorInfo = {
        severity: 'default',
        fill: colors.grey.darken1, // grey
        text: colors.grey.lighten5
      }
      const colorInfo = colorTable.find(
        d => d.severity === severity.toLowerCase()
      )
      return colorInfo ? colorInfo[prop] : defaultColorInfo[prop]
    }
  }
}
</script>

<style lang="scss" scoped>
.setting {
  background-color: #fff9c4;
}
</style>
