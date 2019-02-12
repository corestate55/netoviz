<template>
  <div>
    <el-table
      border
      v-bind:data="alerts"
      v-bind:row-class-name="tableClassSelector"
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
  </div>
</template>

<script>
export default {
  computed: {
    alerts () {
      const req = new XMLHttpRequest()
      let alerts
      req.open('GET', '/alert/all', false)
      req.onload = () => {
        alerts = JSON.parse(req.responseText)
      }
      req.send()
      return alerts
    }
  },
  methods: {
    tableClassSelector (row) {
      if (row.row.severity === 'error') {
        return 'error-row'
      }
      return 'unknown-row'
    }
  }
}
</script>

<style lang="scss" scoped>
.el-table /deep/ .error-row {
  background-color: lightpink;
}
</style>
