import Benchmark from 'benchmark'
import zlib from 'zlib'
import nock from 'nock'
import URL from 'url'
import http from 'http'
import axios from 'axios'
import fetch from 'node-fetch'
import request from 'superagent'

import body from './data'
const postUrl = 'http://localhost:8000/echo'
const json = JSON.stringify(body)

nock('http://localhost:8000')
  .persist()
  .post('/echo', () => true)
  .reply(200, (uri, reqBody) => reqBody, {
    'Cache-Control': 'no-cache',
  })

const postSuite = new Benchmark.Suite()

postSuite
  .add('super#post', {
    defer: true,
    fn: defer =>
      request
        .post(postUrl)
        .set('Accept-Encoding', 'gzip')
        .send(json)
        .then(res => defer.resolve(res)),
  })
  .add('http#post', {
    defer: true,
    fn: defer => {
      const req = http.request(
        // postUrl,
        {
          ...URL.parse(postUrl),
          method: 'POST',
          headers: { 'Accept-Encoding': 'gzip' },
        },
        res => {
          // const gunzip = zlib.createUnzip()
          // res.pipe(gunzip)
          let data = ''
          res.on('data', chunk => {
            data += chunk
          })
          res.on('end', () => {
            return defer.resolve(JSON.parse(data))
          })
        }
      )
      req.write(json)
      req.end()
    },
  })
  .add('axios#post', {
    defer: true,
    fn: defer =>
      axios
        .post(postUrl, json, { headers: { 'Accept-Encoding': 'gzip' } })
        .then(res => defer.resolve(res)),
  })
  .add('fetch#post', {
    defer: true,
    fn: defer =>
      fetch(postUrl, {
        method: 'post',
        headers: { 'Accept-Encoding': 'gzip' },
        body: json,
      }).then(res => defer.resolve(res)),
  })
  .on('cycle', function(event) {
    console.log(String(event.target))
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'))
  })
  .run({ async: false })
