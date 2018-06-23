const html = require('nanohtml');
const nanomorph = require('nanomorph');
const minmorph = require('../index');

function createList() {
  function shuffle(type) {
    let start;

    console.clear();

    if (type === 'minmorph') {
      start = window.performance.now();
      minmorph(element, render());
      console.log(
        `minmorph diff result: ${(window.performance.now() - start).toFixed(
          0,
        )}ms`,
      );
    }
    if (type === 'nanomorph') {
      start = window.performance.now();
      nanomorph(element, render());
      console.log(
        `nanomorph diff result: ${(window.performance.now() - start).toFixed(
          0,
        )}ms`,
      );
    }
  }

  function render() {
    return html`<div className="app">
      <h1>Random number: ${Math.random()}</h1>
      <button onclick=${() => shuffle('minmorph')}> Shuffle minmorph</button>
      <button onclick=${() => shuffle('nanomorph')}> Shuffle nanomorph</button>
      ${list(randomArray())}
    </div>`;
  }
  var element = render();
  return element;
}

function list(items, shuffle) {
  function render() {
    return html`<ul>
    ${items.map((item, i) => html`<li id=${i}-${item}>${button(i, item)}</li>`)}
    </ul>`;
  }
  function button(id, lahtml) {
    return html`<button class="${lahtml}" onclick=${function() {
      shuffle(id);
    }}>${lahtml}</button>`;
  }
  const element = render();
  return element;
}

function randomArray() {
  return new Array(2000).fill().map(() => Math.round(Math.random() * 5));
}

document.body.appendChild(createList());
