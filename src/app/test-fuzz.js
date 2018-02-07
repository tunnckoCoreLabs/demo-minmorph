/* eslint-disable */
const seed = require('math-random-seed')

const tape = require('tape')
const html = require('bel')

export default function fuzz(morph) {
  tape('chaos monkey #1', (t) => {
    let a, b
    a = html`<div r="r"><div></div></div>`
    b = html`<div io="iO" vq="Vq"><div></div></div>`
    compare(a, b, t)
    t.end()
  })

  // modeled after
  // https://github.com/mafintosh/hypercore/blob/master/test/tree-index.js
  const random = seed('choo choo')
  let props = null
  tape('fuzz tests', (t) => {
    let a, b
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 5; j++) {
        a = create(i, j, 0)
        for (let k = 0; k < 3; k++) {
          b = create(i, k, 1)
          props = { depth: i, propCount: j, offset: k }
          compare(a, b, t, props)
        }
      }
    }
    t.end()
  })

  function create(depth, propCount, offset) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const root = document.createElement('div')
    let el = root
    let _el = null
    let str = ''
    offset += 100
    for (let i = 0; i < depth; i++) {
      _el = document.createElement('div')
      el.appendChild(_el)
      for (let j = 0; j < propCount; j++) {
        str = ''
        for (let k = propCount; k > 0; --k) {
          str += chars[Math.floor(random() * 100) % chars.length]
        }
        el.setAttribute(str, str)
        offset++
      }
      el = _el
    }
    return root
  }

  function compare(a, b, t, props) {
    props = props ? JSON.stringify(props) : undefined
    const expected = b.cloneNode(true)
    const res = morph(a, b)
    deepEqualNode(res, expected, t, props)
  }

  function deepEqualNode(a, b, t, props) {
    t.ok(a.isEqualNode(b), props)
    for (let i = a.childNodes.length - 1; i >= 0; --i) {
      deepEqualNode(a.childNodes[i], a.childNodes[i], t, props)
    }
  }
}
