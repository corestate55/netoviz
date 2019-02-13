<template>
  <div>
    <el-input-number
      size="small"
      v-model="alertLimit"
      v-bind:min="1"
      v-bind:max="15"
    />
    <el-button
      size="small"
      v-on:click="setCurrent()"
    >
      Clear selection
    </el-button>
    <el-table
      ref="alertTable"
      highlight-current-row
      v-bind:data="alerts"
      v-bind:row-class-name="tableClassSelector"
      v-on:current-change="handleCurrentChange"
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
import { mapMutations } from 'vuex'

export default {
  data () {
    return {
      alertLimit: 8
    }
  },
  computed: {
    alerts () {
      const req = new XMLHttpRequest()
      let alerts
      req.open('GET', `/alert/${this.alertLimit}`, false)
      // TODO: error handling
      req.onload = () => {
        alerts = JSON.parse(req.responseText)
      }
      req.send()
      return alerts
    }
  },
  methods: {
    ...mapMutations(['setCurrentAlertRow']),
    tableClassSelector (row) {
      const severity = row.row.severity
      const severities = ['fatal', 'error', 'warn', 'info', 'debug']
      if (severities.find(d => d === severity)) {
        return `${severity}-row`
      }
      return 'unknown-row'
    },
    setCurrent (row) {
      this.$refs.alertTable.setCurrentRow(row)
    },
    handleCurrentChange (row) {
      // console.log('handle current change: ', row)
      this.setCurrentAlertRow(row)
    }
  }
}
</script>

<style lang="scss" scoped>
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
