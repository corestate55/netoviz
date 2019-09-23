import Vue from 'vue'
import Router from 'vue-router'
const About = () => ({
  component: import(/* webpackChunkName: "page" */ './views/About')
})
const NotFound = () => ({
  component: import(/* webpackChunkName: "page" */ './components/NotFound')
})
const TableDiagrams = () => ({
  component: import(/* webpackChunkName: "page" */ './views/TableDiagrams')
})
const TableVisualizers = () => ({
  component: import(/* webpackChunkName: "page" */ './views/TableVisualizers')
})
const TableModels = () => ({
  component: import(/* webpackChunkName: "page" */ './views/TableModels')
})
const VisualizeDiagram = () => ({
  component: import(/* webpackChunkName: "viz" */ './views/VisualizeDiagram')
})

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/about',
      component: About
    },
    {
      path: '/',
      component: TableDiagrams
    },
    {
      path: '/visualizer',
      component: TableVisualizers
    },
    {
      path: '/target/:modelFile',
      component: TableVisualizers,
      props: true
    },
    {
      path: '/target',
      component: TableModels
    },
    {
      path: '/visualizer/:visualizer',
      component: TableModels,
      props: true
    },
    {
      path: '/visualizer/:visualizer/:modelFile',
      component: VisualizeDiagram,
      props: true
    },
    {
      path: '/target/:modelFile/:visualizer',
      component: VisualizeDiagram,
      props: true
    },
    {
      path: '*',
      component: NotFound
    }
  ]
})
