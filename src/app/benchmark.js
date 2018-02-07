import bel from 'bel'
import nanomorph from 'nanomorph'
import minmorph from '../index'

function createList () {
  function shuffle (type) {
    let start

    console.clear()

    if (type === 'minmorph') {
      start = window.performance.now()
      minmorph(element, render())
      console.log(`minmorph diff result: ${(window.performance.now() - start).toFixed(0)}ms`)
    }
    if (type === 'nanomorph') {
      start = window.performance.now()
      nanomorph(element, render())
      console.log(`nanomorph diff result: ${(window.performance.now() - start).toFixed(0)}ms`)
    }
  }

  function render () {
    return bel`<div className="app">
      <h1>Random number: ${Math.random()}</h1>
      <button onclick=${() => shuffle('minmorph')}> Shuffle minmorph</button>
      <button onclick=${() => shuffle('nanomorph')}> Shuffle nanomorph</button>
      ${list(randomArray())}
    </div>`
  }
  var element = render()
  return element
}

function list (items, shuffle) {
  function render () {
    return bel`<ul>
    ${items.map((item, i) => bel`<li id=${i}-${item}>${button(i, item)}</li>`)}
    </ul>`
  }
  function button (id, label) {
    return bel`<button class="${label}" onclick=${function () {
      shuffle(id)
    }}>${label}</button>`
  }
  const element = render()
  return element
}

function randomArray () {
  return Array(2000)
    .fill()
    .map(() => Math.round(Math.random() * 5))
}

document.body.appendChild(createList())
