<template>
  <div id="app">
    <el-collapse v-model="activeNames">
      <el-collapse-item
        title="Graph Type & Topology Data Selector"
        name="AppSelectDataTable"
      >
        <AppSelectDataTable />
      </el-collapse-item>
      <el-collapse-item
        title="Alert Table"
        name="AlertTable"
      >
        <AlertTable />
      </el-collapse-item>
    </el-collapse>
    <VisualizeDiagram />
  </div>
</template>

<script>
import AppSelectDataTable from './components/AppSelectDataTable'
import AlertTable from './components/AlertTable'
import VisualizeDiagram from './components/VisualizeDiagram'

export default {
  name: 'app',
  data () {
    return {
      activeNames: ['AppSelectDataTable', 'AlertTable']
    }
  },
  components: {
    AppSelectDataTable,
    AlertTable,
    VisualizeDiagram
  }
}
</script>

<style lang="scss">
#app {
  margin: 0.5em;
}
</style>
