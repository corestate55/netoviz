<template>
  <div>
    <el-row v-bind:gutter="20">
      <el-col v-bind:span="4">
        <el-input-number
          size="small"
          v-model="alertLimit"
          v-on:change="changeTableLineNumber"
          v-bind:min="1"
          v-bind:max="15"
        />
      </el-col>
      <el-col v-bind:span="4">
        <el-button
          round
          size="small"
          type="info"
          icon="el-icon-delete"
          v-bind:disabled="!currentAlertRow"
          v-on:click="setAlertTableCurrentRow()"
        >
          Clear selection
        </el-button>
      </el-col>
      <el-col v-bind:span="6">
        <el-switch
          v-model="enableTimer"
          v-on:change="setAlertCheckTimer()"
          active-text="Enable Timer"
          inactive-text="Disable Timer"
          active-color="#ff4949"
          inactive-color="#409EFF"
        />
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
import { mapGetters, mapMutations } from 'vuex'

export default {
  data () {
    return {
      alerts: [],
      alertLimit: 5,
      enableTimer: true,
      alertCheckTimer: null
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
    stopAlertCheckTimer () {
      clearInterval(this.alertCheckTimer)
      this.alertCheckTimer = null
    },
    startAlertCheckTimer () {
      this.alertCheckTimer = setInterval(() => {
        // const now = new Date()
        // console.log('check alerts: ' + now.toISOString())
        this.updateAlerts()
      }, 10000) // 10sec
    },
    updateAlerts () {
      // update alerts and select head data
      this.requestAlertData()
        .then(() => this.setAlertTableCurrentRow(this.alerts[0]))
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
      const severities = ['fatal', 'error', 'warn', 'info', 'debug']
      if (severities.find(d => d === severity)) {
        return `${severity}-row`
      }
      return 'unknown-row'
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
  .fatal-row {
    background-color: #FDC168;
  }
  .error-row {
    background-color: #FDE58B;
  }
  .warn-row {
    background-color: #FFFFAE;
  }
  .info-row {
    background-color: azure;
  }
  .debug-row {
    background-color: #E8E8E8;
  }
  .unknown-row {
    background-color: #ffe6e6;
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
</style>
