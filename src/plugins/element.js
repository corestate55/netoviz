import Vue from 'vue'
import {
  RadioGroup, RadioButton,
  CheckboxGroup, CheckboxButton,
  Select, Option
} from 'element-ui'
import lang from 'element-ui/lib/locale/lang/ja'
import locale from 'element-ui/lib/locale'
import 'element-ui/lib/theme-chalk/index.css'

locale.use(lang)

Vue.use(RadioGroup)
Vue.use(RadioButton)
Vue.use(CheckboxGroup)
Vue.use(CheckboxButton)
Vue.use(Select)
Vue.use(Option)
