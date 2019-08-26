import Vue from 'vue'
import {
  RadioGroup,
  RadioButton,
  CheckboxGroup,
  CheckboxButton,
  Select,
  Option,
  Table,
  TableColumn,
  Button,
  Input,
  InputNumber,
  Collapse,
  CollapseItem,
  Row,
  Col,
  Switch
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
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(Button)
Vue.use(Input)
Vue.use(InputNumber)
Vue.use(Collapse)
Vue.use(CollapseItem)
Vue.use(Row)
Vue.use(Col)
Vue.use(Switch)
