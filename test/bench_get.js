import Benchmark from 'benchmark'
import zlib from 'zlib'
import http from 'http'
import axios from 'axios'
import fetch from 'node-fetch'
import request from 'superagent'

const getUrl = 'http://localhost:8000/get.json'

const suite = new Benchmark.Suite()

suite
  .add('http#get', {
    defer: true,
    fn: defer =>
      http.get(getUrl, { headers: { 'Accept-Encoding': 'gzip' } }, res => {
        const gunzip = zlib.createUnzip()
        res.pipe(gunzip)
        let data = ''
        gunzip.on('data', chunk => {
          data += chunk
        })
        gunzip.on('end', () => {
          return defer.resolve(JSON.parse(data))
        })
      }),
  })
  .add('super#get', {
    defer: true,
    fn: defer =>
      request
        .get(getUrl)
        .set('Accept-Encoding', 'gzip')
        .then(res => {
          // console.log(res.body)
          defer.resolve(res)
        }),
  })
  .add('axios#get', {
    defer: true,
    fn: defer =>
      axios
        .get(getUrl, { headers: { 'Accept-Encoding': 'gzip' } })
        .then(res => {
          // console.log(res.data)
          defer.resolve(res)
        }),
  })
  .add('fetch#get', {
    defer: true,
    fn: defer =>
      fetch(getUrl, { headers: { 'Accept-Encoding': 'gzip' } }).then(res => {
        res.json().then(json => {
          // console.log(json)
          defer.resolve(json)
        })
      }),
  })
  .on('cycle', function(event) {
    console.log(String(event.target))
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'))
  })
  .run({ async: false })
