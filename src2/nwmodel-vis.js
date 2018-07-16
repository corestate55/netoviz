'use strict'

import * as d3 from 'd3'
import {Networks} from './networks'

d3.json('http://localhost:8080/model/target.json', (error, topoData) => {
  var networks = new Networks(topoData)
  console.log(networks)
})
