/*
  Ava async execution seems to cause issues benchmarking individual libraries.
*/

import test from 'ava'
import nock from 'nock'
import suite from 'chuhai'
import { get } from '../src/http'
import { getAxios } from '../src/axios'
import { getFetch } from '../src/fetch'
import { getSuper } from '../src/superagent'

nock('http://localhost:3000')
  .persist()
  .get('/')
  .reply(200, `{"msg": "Hello", "foo": "bar"}`, {
    'Cache-Control': 'no-cache',
  })

const url = 'http://localhost:8000/1024K.txt'

test('http#get', async t => {
  const res = await get(url)

  t.is(200, res.status)
})

test('axios#get', async t => {
  const res = await getAxios(url)

  t.is(200, res.status)
})

test('fetch#get', async t => {
  const res = await getFetch(url)

  t.is(200, res.status)
})

test('super#get', async t => {
  const res = await getSuper(url)

  t.is(200, res.status)
})

test('bench', t =>
  suite('get', s => {
    s.set('async', false)
    s.set('defer', true)

    s.after(() => {
      t.true(true)
    })

    s.bench('super#get', async defer => defer.resolve(await getSuper(url)))

    s.bench('http#get', async defer => defer.resolve(await get(url)))
    // s.bench('axios#get', async defer => defer.resolve(await getAxios(url)));

    s.bench('fetch#get', async defer => defer.resolve(await getFetch(url)))
  }))
