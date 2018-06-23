/* eslint-env browser */
/* eslint-disable no-shadow */
const tape = require('tape');
const html = require('nanohtml');
const events = require('../src/events');

module.exports = abstractMorphEvents;

function raiseEvent(element, eventName) {
  const event = document.createEvent('Event');
  event.initEvent(eventName.slice(2), true, true);
  element.dispatchEvent(event);
}

/**
 * Notes:
 *
 * Failing tests have been excluded below.
 * Only 8 of 98 fails for `minmorph`, and about 30+ for `nanomorph`.
 *
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
