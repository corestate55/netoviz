import Vue from 'vue'
import ElementUI from 'element-ui'
import locale from 'element-ui/lib/locale/lang/ja'
import 'element-ui/lib/theme-chalk/index.css'
import App from './App.vue'
import store from './store'

Vue.config.productionTip = false
Vue.use(ElementUI, { locale })

new Vue({
  store,
  render: h => h(App)
}).$mount('#app')
