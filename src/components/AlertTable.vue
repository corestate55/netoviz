<template>
  <div>
    <el-table
      border
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
        prop="created_at"
        label="Created at"
      />
    </el-table>
    <el-button v-on:click="setCurrent()">Clear selection</el-button>
  </div>
</template>

<script>
import { mapMutations } from 'vuex'

export default {
  computed: {
    alerts () {
      const req = new XMLHttpRequest()
      let alerts
      req.open('GET', '/alert/all', false)
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
      if (row.row.severity === 'error') {
        return 'error-row'
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
.el-table /deep/ .error-row {
  background-color: lightpink;
}
.el-table /deep/ .current-row {
  font-weight: bold;
  text-decoration: underline;
}
</style>
