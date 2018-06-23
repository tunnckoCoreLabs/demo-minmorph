/* eslint-disable max-lines, max-statements, no-shadow, no-underscore-dangle */
const tape = require('tape');
const html = require('nanohtml');

module.exports = function abstractKeyed(morph) {
  tape('use "id" as a key hint', (t) => {
    t.test('append an element', (t) => {
      const a = html`<ul>
          <li id="a"></li>
          <li id="b"></li>
          <li id="c"></li>
        </ul>`;
      const b = html`<ul>
          <li id="a"></li>
          <li id="new"></li>
          <li id="b"></li>
          <li id="c"></li>
        </ul>`;
      const target = b.outerHTML;

      const oldFirst = a.children[0];
      const oldSecond = a.children[1];
      const oldThird = a.children[2];

      const c = morph(a, b);
      t.equal(oldFirst, c.children[0], 'first is equal');
      t.equal(oldSecond, c.children[2], 'moved second is equal');
      t.equal(oldThird, c.children[3], 'moved third is equal');
      t.equal(c.outerHTML, target);
      t.end();
    });

    t.test('handle non-id elements', (t) => {
      const a = html`<ul>
          <li></li>
          <li id="a"></li>
          <li id="b"></li>
          <li id="c"></li>
          <li></li>
        </ul>`;
      const b = html`<ul>
          <li></li>
          <li id="a"></li>
          <li id="new"></li>
          <li id="b"></li>
          <li id="c"></li>
          <li></li>
        </ul>`;
      const target = b.outerHTML;

      const oldFirst = a.children[0];
      const oldSecond = a.children[1];
      const oldThird = a.children[2];
      const oldForth = a.children[3];

      const c = morph(a, b);
      t.equal(oldFirst, c.children[0], 'first empty is equal');
      t.equal(oldSecond, c.children[1], 'second is equal');
      t.equal(oldThird, c.children[3], 'moved third is equal');
      t.equal(oldForth, c.children[4], 'moved forth is equal');
      t.equal(c.outerHTML, target);
      t.end();
    });
    t.test('copy over children', (t) => {
      const a = html`<section>'hello'<section>`;
      const b = html`<section><div></div><section>`;
      const expected = b.outerHTML;

      const c = morph(a, b);
      t.equal(c.outerHTML, expected, expected);
      t.end();
    });

    t.test('remove an element', (t) => {
      const a = html`<ul><li id="a"></li><li id="b"></li><li id="c"></li></ul>`;
      const b = html`<ul><li id="a"></li><li id="c"></li></ul>`;

      const oldFirst = a.children[0];
      const oldThird = a.children[2];
      const expected = b.outerHTML;

      const c = morph(a, b);

      t.equal(c.children[0], oldFirst, 'first is equal');
      t.equal(c.children[1], oldThird, 'second untouched');
      t.equal(c.outerHTML, expected);
      t.end();
    });

    t.test('swap proxy elements', (t) => {
      const nodeA = html`<li id="a"></li>`;
      const placeholderA = html`<div id="a" data-placeholder=true></div>`;
      placeholderA.isSameNode = (el) => el === nodeA;

      const nodeB = html`<li id="b"></li>`;
      const placeholderB = html`<div id="b" data-placeholder=true></div>`;
      placeholderB.isSameNode = (el) => el === nodeB;

      const a = html`<ul>${nodeA}${nodeB}</ul>`;
      const b = html`<ul>${placeholderB}${placeholderA}</ul>`;
      const c = morph(a, b);

      t.equal(c.children[0], nodeB, 'c.children[0] === nodeB');
      t.equal(c.children[1], nodeA, 'c.children[1] === nodeA');
      t.end();
    });

    t.test('id match still morphs', (t) => {
      const a = html`<li id="12">FOO</li>`;
      const b = html`<li id="12">BAR</li>`;
      const target = b.outerHTML;
      const c = morph(a, b);
      t.equal(c.outerHTML, target);
      t.end();
    });

    t.test('remove orphaned keyed nodes', (t) => {
      const a = html`
          <div>
            <div>1</div>
            <li id="a">a</li>
          </div>
        `;
      const b = html`
          <div>
            <div>2</div>
            <li id="b">b</li>
          </div>
        `;
      const expected = b.outerHTML;
      const c = morph(a, b);
      t.equal(c.outerHTML, expected);
      t.end();
    });

    t.test('whitespace', (t) => {
      const a = html`<ul>
    </ul>`;
      const b = html`<ul><li></li><li></li>
    </ul>`;
      const expected = b.outerHTML;
      const c = morph(a, b);
      t.equal(c.outerHTML, expected);
      t.end();
    });

    t.test('nested with id', (t) => {
      const child = html`<div id="child">child</div>`;
      const placeholder = html`<div id="child">placeholder</div>`;
      placeholder.isSameNode = (el) => el === child;

      const a = html`<div><div id="parent">${child}</div></div>`;
      const b = html`<div><div id="parent">${placeholder}</div></div>`;

      const c = morph(a, b);
      t.equal(c.children[0].children[0], child, 'is the same node');
      t.end();
    });

    t.test('nested without id', (t) => {
      // t.plan(4)
      const child = html`<div id="child">first</div>`;
      const placeholder = html`<div id="child">second</div>`;
      placeholder.isSameNode = (el) => {
        // t.pass('should be called')
        console.log('should be called');
        return true;
      };

      const c = morph(child, placeholder);
      t.equal(c.textContent, child.textContent, 'should be same equal');

      const a = html`<div>${child}</div>`;
      const b = html`<div>${placeholder}</div>`;

      const d = morph(a, b);
      t.equal(d.children[0], child, 'children same as child');

      const a2 = html`<div><div>${child}</div></div>`;
      const b2 = html`<div><div>${placeholder}</div></div>`;

      const d2 = morph(a2, b2);

      const actual = d2.children[0].children[0];
      const expected = child;

      t.equal(actual, expected, 'nested is same node as child');
      t.end();
    });
  });
};
