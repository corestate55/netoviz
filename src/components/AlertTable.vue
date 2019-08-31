<template>
  <div>
    <div
      v-bind:style="{ display: debug }"
    >
      host (input): {{ alertHost }},
      currentAlertRow: {{ currentAlertRow }}
    </div>
    <el-row v-bind:gutter="10">
      <el-col v-bind:span="4">
        Rows :
        <el-input-number
          v-model="alertLimit"
          size="small"
          controls-position="right"
          v-bind:min="1"
          v-bind:max="15"
          v-on:change="changeTableLineNumber"
        />
      </el-col>
      <el-col v-bind:span="4">
        <el-button
          round
          size="small"
          type="info"
          icon="el-icon-delete"
          v-bind:disabled="disableClearAlertTableButton"
          v-on:click="clickClearSelectionButton"
        >
          Clear selection
        </el-button>
      </el-col>
      <el-col v-bind:span="12">
        Host to Highlight:
        <el-input
          v-model="alertHostInput"
          class="host-input"
          clearable
          placeholder="node OR layer__node"
          size="small"
          v-on:input="inputAlertHost"
        />
      </el-col>
    </el-row>
    <el-row v-bind:gutter="10">
      <el-col v-bind:span="6">
        <el-switch
          v-model="enableTimer"
          active-text="Enable Timer"
          inactive-text="Disable Timer"
          active-color="#409EFF"
          inactive-color="#ff4949"
          v-on:change="setAlertCheckTimer()"
        />
      </el-col>
      <el-col v-bind:span="6">
        Interval(sec) :
        <el-input-number
          v-model="alertPollingInterval"
          size="small"
          controls-position="right"
          v-bind:min="1"
          v-bind:max="30"
          v-on:change="resetAlertCheckTimer()"
        />
      </el-col>
      <el-col v-bind:span="8">
        Updated alert table at:<br>
        <span id="alert-update-time">{{ alertUpdatedTime }}</span>
      </el-col>
    </el-row>
    <!-- alert data table -->
    <el-table
      ref="alertTable"
      highlight-current-row
      v-bind:data="alerts"
      v-bind:row-class-name="tableClassSelector"
      v-on:current-change="handleAlertTableCurrentChange"
    >
      <el-table-column
        prop="id"
        label="ID"
        width="100"
      />
      <el-table-column
        prop="severity"
        label="Severity"
        width="100"
      />
      <el-table-column
        prop="host"
        label="Host"
        width="100"
      />
      <el-table-column
        prop="message"
        label="Message"
      />
      <el-table-column
        prop="date"
        label="Date"
      />
    </el-table>
  </div>
</template>

<script>
import { debounce } from 'debounce'
export default {
  data () {
    return {
      alerts: [],
      alertLimit: 5,
      alertPollingInterval: 10, // default: 10sec
      alertCheckTimer: null,
      alertUpdatedTime: null,
      alertHostInput: '',
      unwatchAlertHost: null,
      fromAlertHostInput: false,
      enableTimer: true,
      debug: 'none' // 'none' or 'block' to appear debug container
    }
  },
  computed: {
    currentAlertRow: {
      get () { return this.$store.getters.currentAlertRow },
      set (value) { this.$store.commit('setCurrentAlertRow', value) }
    },
    alertHost: {
      get () { return this.$store.getters.alertHost },
      set (value) { this.$store.commit('setAlertHost', value) }
    },
    disableClearAlertTableButton () {
      return (this.currentAlertRow && Object.keys(this.currentAlertRow).length < 1)
    }
  },
  mounted () {
    this.updateAlerts() // initial data
    this.startAlertCheckTimer()
    this.unwatchAlertHost = this.$store.watch(
      state => state.alertHost,
      (newHost, oldHost) => {
        this.alertHostInput = newHost
        this.inputAlertHost()
      }
    )
  },
  beforeDestroy () {
    this.unwatchAlertHost()
    this.stopAlertCheckTimer()
  },
  methods: {
    setAlertCheckTimer () {
      this.enableTimer ? this.startAlertCheckTimer() : this.stopAlertCheckTimer()
    },
    resetAlertCheckTimer () {
      this.stopAlertCheckTimer()
      this.setAlertCheckTimer()
    },
    stopAlertCheckTimer () {
      clearInterval(this.alertCheckTimer)
      this.alertCheckTimer = null
    },
    startAlertCheckTimer () {
      this.alertCheckTimer = setInterval(() => {
        this.updateAlerts()
      }, this.alertPollingInterval * 1000) // sec
    },
    updateAlerts () {
      // update alerts and select head data
      // console.log('updateAlerts: ', new Date())
      this.requestAlertData().then(() => {
        // console.log('[AlertTable] updateAlerts')
        this.alertUpdatedTime = new Date()
        this.setAlertTableCurrentRow(this.alerts[0])
      })
    },
    changeTableLineNumber () {
      this.requestAlertData()
    },
    async requestAlertData () {
      try {
        // console.log('[AlertTable] request alert data')
        const response = await fetch(`/alert/${this.alertLimit}`)
        const newAlerts = await response.json()
        // check alerts (alert table rows) update:
        // changed table rows OR comes new data(id)
        if (this.alerts.length !== newAlerts.length || newAlerts[0].id !== this.alerts[0].id) {
          this.alerts = newAlerts
        }
      } catch (error) {
        console.error('fetch alert failed: ', error)
      }
    },
    tableClassSelector (row) {
      const severity = row.row.severity
      const severityRegexp = new RegExp(severity, 'i')
      const severities = [
        'disaster', 'high', 'average', 'warning', 'information'
      ]
      if (severities.find(s => s.match(severityRegexp))) {
        return `${severity.toLowerCase()}-row`
      }
      return 'not-classified-row'
    },
    clickClearSelectionButton () {
      this.alertHostInput = ''
      this.setAlertTableCurrentRow({})
    },
    layerOfAlertHostInput () {
      if (this.alertHostInput.match(new RegExp('(.+)__(.+)'))) {
        return this.alertHostInput.split('__').shift()
      }
      return null
    },
    alertFromAlertHostInput () {
      const alert = {
        message: 'selected directly',
        severity: 'information',
        date: (new Date()).toISOString(),
        // for drill-down:
        // it must identify object that has same name with layer (path)
        layer: this.layerOfAlertHostInput()
      }
      alert.host = alert.layer
        ? this.alertHostInput.split('__').pop() // when 'layer__node' format
        : this.alertHostInput
      return alert
    },
    inputAlertHost: debounce(function () {
      // NOTICE: do not use arrow-function for debounce.
      this.fromAlertHostInput = true
      // clear table selection
      this.setAlertTableCurrentRow({})
      // set dummy alert to redraw diagram.
      this.setAlertTableCurrentRow(this.alertFromAlertHostInput())
      this.fromAlertHostInput = false
    }, 500), // 0.5sec
    setAlertTableCurrentRow (row) {
      // console.log('[AlertTable] set alert table current row: ', row)

      // it fire current-change event on alertTable,
      // so called handleAlertTableCurrentChange in continuity.
      this.$refs.alertTable.setCurrentRow(row)
    },
    handleAlertTableCurrentChange (row) {
      // console.log('[AlertTable] handle current change: ', row)

      // from 'update alert-table' or 'click alert-table'
      if (!this.fromAlertHostInput) {
        this.alertHostInput = row && row.host ? row.host : ''
        this.currentAlertRow = row
      }
      // from alert-host input:
      // when row is empty, it clear before redraw diagram (NOP).
      if (row && Object.keys(row).length > 0) {
        this.currentAlertRow = row
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.el-button {
  margin-left: 10px;
}
.el-row {
  margin-bottom: 15px;
}
.host-input {
  width: 200px;
}
.el-table /deep/ {
  table {
    border-collapse: collapse;
  }
  th, td {
    padding-top: 0.5em;
    padding-bottom: 0.5em;
  }
  .disaster-row {
    background-color: lightpink; // bright red
  }
  .high-row {
    background-color: mistyrose; // red
  }
  .average-row {
    background-color: palegoldenrod; // orange
  }
  .warning-row {
    background-color: lightyellow; // bright yellow
  }
  .information-row {
    background-color: honeydew; // bright green
  }
  .not-classified-row {
    background-color: lightgray; // grey
  }
  .current-row {
    td {
      background-color: inherit;
    }
    border: 2px solid #B71001;
    font-weight: bold;
    text-decoration: underline;
  }
}
#alert-update-time {
  background-color: lightgoldenrodyellow;
  color: #303030;
}
</style>
