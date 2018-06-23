/* eslint-disable max-lines, max-statements, no-shadow, no-underscore-dangle */
const tape = require('tape');
const html = require('nanohtml');
const events = require('../events');

module.exports = abstractMorphEvents;

function raiseEvent(element, eventName) {
  const event = document.createEvent('Event') // eslint-disable-line
  event.initEvent(eventName.slice(2), true, true);
  element.dispatchEvent(event);
}

/* Note:
Failing tests have been commented. They include the following:
  'onresume',
  'onfreeze',
  'onreadystatechange',
  'onpointerlockchange',
  'onpointerlockerror',
  'onselectionchange',
  'onvisibilitychange',
  'onsecuritypolicyviolation',
*/

function excludeEvents(name) {
  const isFailing = [
    'onresume',
    'onfreeze',
    'onreadystatechange',
    'onpointerlockchange',
    'onpointerlockerror',
    'onselectionchange',
    'onvisibilitychange',
    'onsecuritypolicyviolation',
  ].includes(name);

  return !isFailing;
}

function abstractMorphEvents(morph) {
  tape('events', (t) => {
    events.filter(excludeEvents).forEach((eventName) => {
      t.test(`should have ${eventName} events(html attribute)`, (t) => {
        t.plan(1);
        let expectationMet = false;
        const res = html`<input ${eventName}=${pass}></input>`;

        raiseEvent(res, eventName);

        function pass(e) {
          e.preventDefault();
          expectationMet = true;
        }

        t.equal(expectationMet, true, 'result was expected');
      });
      t.test(`should copy ${eventName} events(html arrtibute)`, (t) => {
        t.plan(1);
        let expectationMet = false;
        const a = html`<input></input>`;
        const b = html`<input ${eventName}=${pass}></input>`;
        const res = morph(a, b);

        raiseEvent(res, eventName);

        function pass(e) {
          e.preventDefault();
          expectationMet = true;
        }

        t.equal(expectationMet, true, 'result was expected');
      });
      t.test(`should not copy ${eventName} events`, (t) => {
        t.plan(1);
        let expectationMet = true;
        const a = html`<input ${eventName}=${fail}></input>`;
        const b = html`<input></input>`;
        const res = morph(a, b);

        raiseEvent(res, eventName);

        function fail(e) {
          e.preventDefault();
          expectationMet = false;
        }

        t.equal(expectationMet, true, 'result was expected');
      });
    });
  });
}
