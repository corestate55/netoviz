import Vue from 'vue'
import {
  RadioGroup, Radio,
  CheckboxGroup, Checkbox,
  Select, Option,
  Table, TableColumn,
  Button,
  Collapse, CollapseItem
} from 'element-ui'
import lang from 'element-ui/lib/locale/lang/ja'
import locale from 'element-ui/lib/locale'
import 'element-ui/lib/theme-chalk/index.css'

locale.use(lang)

Vue.use(RadioGroup)
Vue.use(Radio)
Vue.use(CheckboxGroup)
Vue.use(Checkbox)
Vue.use(Select)
Vue.use(Option)
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(Button)
Vue.use(Collapse)
Vue.use(CollapseItem)
