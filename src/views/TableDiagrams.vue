<template>
  <v-row>
    <v-col>
      <v-data-table
        caption="Select model/visualizer"
        dense
        hide-default-header
        v-bind:headers="headers"
        v-bind:items="diagrams"
      >
        <template v-slot:header="{ props }">
          <thead class="v-data-table-header">
            <tr>
              <th
                v-for="(header, index) in props.headers"
                v-bind:key="index"
              >
                <router-link
                  v-if="header.link"
                  v-bind:to="header.link"
                >
                  {{ header.text }}
                </router-link>
                <span v-else>
                  {{ header.text }}
                </span>
              </th>
            </tr>
          </thead>
        </template>
        <template v-slot:item="props">
          <tr>
            <td
              v-for="(col, index) in Object.keys(props.item)"
              v-bind:key="index"
            >
              <router-link v-bind:to="props.item[col].link">
                {{ props.item[col].text }}
              </router-link>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-col>
  </v-row>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'TableDiagrams',
  computed: {
    ...mapGetters(['modelFiles', 'visualizers']),
    headers () {
      const head = [
        {
          text: 'Model',
          value: 'model',
          sortable: false,
          link: null
        }
      ]
      return head.concat(
        this.visualizers.map(v => ({
          text: v.text,
          value: v.value,
          sortable: false,
          link: `/visualizer/${v.value}`
        }))
      )
    },
    diagrams () {
      const rows = []
      for (const modelFile of this.modelFiles) {
        const row = {
          model: {
            text: modelFile.label,
            value: modelFile.file,
            link: `/target/${modelFile.file}`
          }
        }
        for (const visualizer of this.visualizers) {
          row[visualizer.value] = {
            text: visualizer.text,
            value: visualizer.value,
            link: `/target/${modelFile.file}/${visualizer.value}`
          }
        }
        rows.push(row)
      }
      return rows
    }
  }
}
</script>

<style scoped></style>
