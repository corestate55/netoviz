<template>
  <div>
    <div
      v-bind:style="{ display: debug }"
    >
      currentAlertRow: {{ currentAlertRow }}
    </div>
    <el-row v-bind:gutter="20">
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
          v-bind:disabled="currentAlertRow && Object.keys(currentAlertRow).length < 1"
          v-on:click="setAlertTableCurrentRow({})"
        >
          Clear selection
        </el-button>
      </el-col>
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
    </el-row>
    <p>
      Updated alert table at:
      <span id="alert-update-time">{{ alertUpdatedTime }}</span>
    </p>
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
import { mapGetters, mapMutations } from 'vuex'

export default {
  data () {
    return {
      alerts: [],
      alertLimit: 5,
      alertPollingInterval: 10, // default: 10sec
      alertCheckTimer: null,
      alertUpdatedTime: null,
      enableTimer: true,
      debug: 'none' // 'none' or 'block' to appear debug container
    }
  },
  computed: {
    ...mapGetters(['currentAlertRow'])
  },
  mounted () {
    this.updateAlerts() // initial data
    this.startAlertCheckTimer()
  },
  beforeDestroy () {
    this.stopAlertCheckTimer()
  },
  methods: {
    ...mapMutations(['setCurrentAlertRow']),
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
        // const now = new Date()
        // console.log('check alerts: ' + now.toISOString())
        this.updateAlerts()
      }, this.alertPollingInterval * 1000) // sec
    },
    updateAlerts () {
      // update alerts and select head data
      // console.log('updateAlerts: ', new Date())
      this.requestAlertData()
        .then(() => {
          this.alertUpdatedTime = new Date()
          this.setAlertTableCurrentRow(this.alerts[0])
        })
    },
    changeTableLineNumber () {
      this.requestAlertData()
    },
    async requestAlertData () {
      try {
        const response = await fetch(`/alert/${this.alertLimit}`)
        this.alerts = await response.json()
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
      return 'not-classifed-row'
    },
    setAlertTableCurrentRow (row) {
      this.$refs.alertTable.setCurrentRow(row)
    },
    handleAlertTableCurrentChange (row) {
      // console.log('handle current change: ', row)
      this.setCurrentAlertRow(row)
    }
  }
}
</script>

<style lang="scss" scoped>
.el-button {
  margin-left: 10px;
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
    background-color: grey; // grey
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
