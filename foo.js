const uniq = require('arr-union')
const events = require('./src/events')

const arr = [
  // attribute events (can be set with attributes)
  'onclick',
  'ondblclick',
  'onmousedown',
  'onmouseup',
  'onmouseover',
  'onmousemove',
  'onmouseout',
  'onmouseenter',
  'onmouseleave',
  'ontouchcancel',
  'ontouchend',
  'ontouchmove',
  'ontouchstart',
  'ondragstart',
  'ondrag',
  'ondragenter',
  'ondragleave',
  'ondragover',
  'ondrop',
  'ondragend',
  'onkeydown',
  'onkeypress',
  'onkeyup',
  'onunload',
  'onabort',
  'onerror',
  'onresize',
  'onscroll',
  'onselect',
  'onchange',
  'onsubmit',
  'onreset',
  'onfocus',
  'onblur',
  'oninput',
  // other common events
  'oncontextmenu',
  'onfocusin',
  'onfocusout'
]

const res = uniq(arr, events).filter(function excludeEvents (name) {
  const is = [
    'onresume',
    'onfreeze',
    'onreadystatechange',
    'onpointerlockchange',
    'onpointerlockerror',
    'onselectionchange',
    'onvisibilitychange',
    'onsecuritypolicyviolation'
  ].includes(name)
  return !is
})

console.log(res.length)
