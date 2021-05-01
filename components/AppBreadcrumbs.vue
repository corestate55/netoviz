<template>
  <v-breadcrumbs v-bind:items="items" divider=">" />
</template>

<script>
export default {
  props: {
    path: {
      type: String,
      default: '/',
      required: false
    }
  },
  computed: {
    items() {
      let currentPath = ''
      const pathTexts = ['index'].concat(this.path.split('/').filter((d) => d))
      const crumbs = [
        this.makeCrumb(pathTexts[0], currentPath, pathTexts.length - 1 === 0)
      ]
      for (let i = 1; i < pathTexts.length; i++) {
        currentPath = [currentPath, pathTexts[i]].join('/')
        crumbs.push(
          this.makeCrumb(pathTexts[i], currentPath, pathTexts.length - 1 === i)
        )
      }
      return crumbs
    }
  },
  methods: {
    makeCrumb(text, to, disable) {
      return {
        text,
        to: to || '/',
        exact: true,
        disable
      }
    }
  }
}
</script>

<style scoped></style>
