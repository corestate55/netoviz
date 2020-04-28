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
              <TableAlertsInputHost v-model="alertHostInput" />
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
import TableAlertsInputHost from './TableAlertsInputHost'
import { getAlertsFromServer, severityColor } from '~/lib/alerts'

export default {
  components: {
    TableAlertsInputHost
  },
  data() {
    return {
      alerts: [],
      alertLimit: 15, // default: fetch 15 rows (per polling)
      alertPollingInterval: 10, // default: 10sec
      alertCheckTimer: null,
      alertUpdatedTime: null,
      alertHostInput: '',
      alertTableHeader: Object.freeze([
        { text: 'ID', sortable: true, value: 'id' },
        { text: 'Severity', sortable: true, value: 'severity' },
        { text: 'Host', sortable: true, value: 'host' },
        { text: 'Message', sortable: true, value: 'message' },
        { text: 'Date', sortable: true, value: 'date' }
      ]),
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
    async updateAlerts() {
      // update alerts and select head data
      // console.log('updateAlerts: ', new Date())
      const newAlerts = await getAlertsFromServer(this.alertLimit)
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
      // Add props for node highlighting when table row is clicked or updated.
      row.layer = ''
      row.tp = ''
      // update alert host input
      this.alertHostInput = row.host || ''
      // update selected row in alert table
      this.currentAlertRow = row
    },
    severityColor(prop, severity) {
      // delegate: color table search
      return severityColor(prop, severity)
    }
  }
}
</script>

<style lang="scss" scoped>
.setting {
  background-color: #fff9c4;
}
</style>
