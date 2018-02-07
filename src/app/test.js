/* eslint-disable max-lines, max-statements, no-shadow */
import tape from 'tape'
import html from 'bel'
import nanomorph from 'nanomorph'
import minmorph from '../index'

abstractMorph(minmorph)
abstractKeyed(minmorph)

function abstractMorph (morph) {
  tape('abstract morph', (t) => {
    t.test('root level', (t) => {
      t.test('should replace a node', (t) => {
        t.plan(1)
        const a = html`<p>hello world</p>`
        const b = html`<div>hello world</div>`
        const expected = b.outerHTML
        const res = morph(a, b)
        t.equal(res.outerHTML, expected, 'result was expected')
      })

      t.test('should morph a text node', (t) => {
        t.plan(1)
        const a = html`<p>hello world</p>`
        const b = html`<p>hello you</p>`
        const expected = b.outerHTML
        const res = morph(a, b)
        t.equal(res.outerHTML, expected, 'result was expected')
      })

      t.test('should morph a node with namespaced attribute', (t) => {
        t.plan(1)
        const a = html`<svg><use xlink:href="#heybooboo"></use></svg>`
        const b = html`<svg><use xlink:href="#boobear"></use></svg>`
        const expected = b.outerHTML
        const res = morph(a, b)
        t.equal(res.outerHTML, expected, 'result was expected')
      })

      t.test('should ignore if node is same', (t) => {
        t.plan(1)
        const a = html`<p>hello world</p>`
        const expected = a.outerHTML
        const res = morph(a, a)
        t.equal(res.outerHTML, expected, 'result was expected')
      })
    })

    t.test('nested', (t) => {
      t.test('should replace a node', (t) => {
        t.plan(1)
        const a = html`<main><p>hello world</p></main>`
        const b = html`<main><div>hello world</div></main>`
        const expected = b.outerHTML
        const res = morph(a, b)
        t.equal(res.outerHTML, expected, 'result was expected')
      })

      t.test('should replace a text node', (t) => {
        t.plan(1)
        const a = html`<main><p>hello world</p></main>`
        const b = html`<main><p>hello you</p></main>`
        const expected = b.outerHTML
        const res = morph(a, b)
        t.equal(res.outerHTML, expected, 'result was expected')
      })

      t.test('should replace a node', (t) => {
        t.plan(1)
        const a = html`<main><p>hello world</p></main>`
        const res = morph(a, a)
        const expected = a.outerHTML
        t.equal(res.outerHTML, expected, 'result was expected')
      })

      t.test('should append a node', (t) => {
        t.plan(1)
        const a = html`<main></main>`
        const b = html`<main><p>hello you</p></main>`
        const expected = b.outerHTML
        const res = morph(a, b)
        t.equal(res.outerHTML, expected, 'result was expected')
      })

      t.test('should remove a node', (t) => {
        t.plan(1)
        const a = html`<main><p>hello you</p></main>`
        const b = html`<main></main>`
        const expected = b.outerHTML
        const res = morph(a, b)
        t.equal(res.outerHTML, expected, 'result was expected')
      })
    })

    t.test('values', (t) => {
      t.test('if new tree has no value and old tree does, remove value', (t) => {
        t.plan(4)
        let a = html`<input type="text" value="howdy" />`
        let b = html`<input type="text" />`
        let res = morph(a, b)
        t.equal(res.getAttribute('value'), null)
        t.equal(res.value, '')

        a = html`<input type="text" value="howdy" />`
        b = html`<input type="text" value=${null} />`
        res = morph(a, b)

        t.equal(res.getAttribute('value'), null)
        t.equal(res.value, '')
      })

      t.test(
        'if new tree has value and old tree does too, set value from new tree',
        (t) => {
          t.plan(4)
          let a = html`<input type="text" value="howdy" />`
          let b = html`<input type="text" value="hi" />`
          let res = morph(a, b)
          t.equal(res.value, 'hi')

          a = html`<input type="text"/>`
          a.value = 'howdy'
          b = html`<input type="text"/>`
          b.value = 'hi'
          res = morph(a, b)
          t.equal(res.value, 'hi')

          a = html`<input type="text" value="howdy"/>`
          b = html`<input type="text"/>`
          b.value = 'hi'
          res = morph(a, b)
          t.equal(res.value, 'hi')

          a = html`<input type="text"/>`
          a.value = 'howdy'
          b = html`<input type="text" value="hi"/>`
          res = morph(a, b)
          t.equal(res.value, 'hi')
        }
      )
    })

    t.test('isSameNode', (t) => {
      t.test('should return a if true', (t) => {
        t.plan(1)
        const a = html`<div>YOLO</div>`
        const b = html`<div>FOMO</div>`
        b.isSameNode = (el) => true
        const res = morph(a, b)
        t.equal(res.childNodes[0].data, 'YOLO')
      })

      t.test('should return b if false', (t) => {
        t.plan(1)
        const a = html`<div>YOLO</div>`
        const b = html`<div>FOMO</div>`
        b.isSameNode = (el) => false
        const res = morph(a, b)

        t.equal(res.childNodes[0].data, 'FOMO')
      })
    })

    t.test('lists', (t) => {
      t.test('should append nodes', (t) => {
        t.plan(1)
        const a = html`<ul></ul>`
        const b = html`<ul><li>1</li><li>2</li><li>3</li><li>4</li><li>5</li></ul>`
        const expected = b.outerHTML
        const res = morph(a, b)
        t.equal(res.outerHTML, expected, 'result was expected')
      })

      t.test('should remove nodes', (t) => {
        t.plan(1)
        const a = html`<ul><li>1</li><li>2</li><li>3</li><li>4</li><li>5</li></ul>`
        const b = html`<ul></ul>`
        const res = morph(a, b)
        const expected = b.outerHTML
        t.equal(res.outerHTML, expected, 'result was expected')
      })
    })

    t.test('selectables', (t) => {
      t.test('should append nodes', (t) => {
        t.plan(1)
        const a = html`<select></select>`
        const b = html`<select><option>1</option><option>2</option><option>3</option><option>4</option></select>`
        const expected = b.outerHTML
        const res = morph(a, b)
        t.equal(res.outerHTML, expected, 'result was expected')
      })

      t.test('should append nodes (including optgroups)', (t) => {
        t.plan(1)
        const a = html`<select></select>`
        const b = html`<select><optgroup><option>1</option><option>2</option></optgroup><option>3</option><option>4</option></select>`
        const expected = b.outerHTML
        const res = morph(a, b)
        t.equal(res.outerHTML, expected, 'result was expected')
      })

      t.test('should remove nodes', (t) => {
        t.plan(1)
        const a = html`<select><option>1</option><option>2</option><option>3</option><option>4</option></select>`
        const b = html`<select></select>`
        const expected = b.outerHTML
        const res = morph(a, b)
        t.equal(res.outerHTML, expected, 'result was expected')
      })

      t.test('should remove nodes (including optgroups)', (t) => {
        t.plan(1)
        const a = html`<select><optgroup><option>1</option><option>2</option></optgroup><option>3</option><option>4</option></select>`
        const b = html`<select></select>`
        const expected = b.outerHTML
        const res = morph(a, b)
        t.equal(res.outerHTML, expected, 'result was expected')
      })

      t.test('should add selected', (t) => {
        t.plan(1)
        const a = html`<select><option>1</option><option>2</option></select>`
        const b = html`<select><option>1</option><option selected>2</option></select>`
        const expected = b.outerHTML
        const res = morph(a, b)
        t.equal(res.outerHTML, expected, 'result was expected')
      })

      t.test('should add selected (xhtml)', (t) => {
        t.plan(1)
        const a = html`<select><option>1</option><option>2</option></select>`
        const b = html`<select><option>1</option><option selected="selected">2</option></select>`
        const expected = b.outerHTML
        const res = morph(a, b)
        t.equal(res.outerHTML, expected, 'result was expected')
      })

      t.test('should switch selected', (t) => {
        t.plan(1)
        const a = html`<select><option selected="selected">1</option><option>2</option></select>`
        const b = html`<select><option>1</option><option selected="selected">2</option></select>`
        const expected = b.outerHTML
        const res = morph(a, b)
        t.equal(res.outerHTML, expected, 'result was expected')
      })
    })

    t.test('should replace nodes', (t) => {
      t.plan(1)
      const a = html`<ul><li>1</li><li>2</li><li>3</li><li>4</li><li>5</li></ul>`
      const b = html`<ul><div>1</div><li>2</li><p>3</p><li>4</li><li>5</li></ul>`
      const expected = b.outerHTML
      const res = morph(a, b)
      t.equal(res.outerHTML, expected, 'result was expected')
    })

    t.test('should replace nodes after multiple iterations', (t) => {
      t.plan(2)

      const a = html`<ul></ul>`
      const b = html`<ul><li>1</li><li>2</li><li>3</li><li>4</li><li>5</li></ul>`
      const expected = b.outerHTML
      const res = morph(a, b)
      t.equal(res.outerHTML, expected, 'result was expected')

      const x = html`<ul><div>1</div><li>2</li><p>3</p><li>4</li><li>5</li></ul>`
      const expected2 = x.outerHTML

      const zzz = morph(a, x)
      t.equal(zzz.outerHTML, expected2, 'result was expected')
    })
  })
}

function abstractKeyed (morph) {
  tape('use "id" as a key hint', (t) => {
    t.test('append an element', (t) => {
      const a = html`<ul>
      <li id="a"></li>
      <li id="b"></li>
      <li id="c"></li>
    </ul>`
      const b = html`<ul>
      <li id="a"></li>
      <li id="new"></li>
      <li id="b"></li>
      <li id="c"></li>
    </ul>`
      const target = b.outerHTML

      const oldFirst = a.children[0]
      const oldSecond = a.children[1]
      const oldThird = a.children[2]

      const c = morph(a, b)
      t.equal(oldFirst, c.children[0], 'first is equal')
      t.equal(oldSecond, c.children[2], 'moved second is equal')
      t.equal(oldThird, c.children[3], 'moved third is equal')
      t.equal(c.outerHTML, target)
      t.end()
    })

    t.test('handle non-id elements', (t) => {
      const a = html`<ul>
      <li></li>
      <li id="a"></li>
      <li id="b"></li>
      <li id="c"></li>
      <li></li>
    </ul>`
      const b = html`<ul>
      <li></li>
      <li id="a"></li>
      <li id="new"></li>
      <li id="b"></li>
      <li id="c"></li>
      <li></li>
    </ul>`
      const target = b.outerHTML

      const oldSecond = a.children[1]
      const oldThird = a.children[2]
      const oldForth = a.children[3]

      const c = morph(a, b)
      t.equal(oldSecond, c.children[1], 'second is equal')
      t.equal(oldThird, c.children[3], 'moved third is equal')
      t.equal(oldForth, c.children[4], 'moved forth is equal')
      t.equal(c.outerHTML, target)
      t.end()
    })

    t.test('copy over children', (t) => {
      const a = html`<section>'hello'<section>`
      const b = html`<section><div></div><section>`
      const expected = b.outerHTML

      const c = morph(a, b)
      t.equal(c.outerHTML, expected, expected)
      t.end()
    })

    t.test('remove an element', (t) => {
      const a = html`<ul><li id="a"></li><li id="b"></li><li id="c"></li></ul>`
      const b = html`<ul><li id="a"></li><li id="c"></li></ul>`

      const oldFirst = a.children[0]
      const oldThird = a.children[2]
      const expected = b.outerHTML

      const c = morph(a, b)

      t.equal(c.children[0], oldFirst, 'first is equal')
      t.equal(c.children[1], oldThird, 'second untouched')
      t.equal(c.outerHTML, expected)
      t.end()
    })

    // TODO
    t.test('swap proxy elements', (t) => {
      const nodeA = html`<li id="a"></li>`
      const placeholderA = html`<div id="a" data-placeholder=true></div>`
      placeholderA.isSameNode = (el) => el === nodeA

      const nodeB = html`<li id="b"></li>`
      const placeholderB = html`<div id="b" data-placeholder=true></div>`
      placeholderB.isSameNode = (el) => el === nodeB

      const a = html`<ul>${nodeA}${nodeB}</ul>`
      const b = html`<ul>${placeholderB}${placeholderA}</ul>`
      const c = morph(a, b)

      t.equal(c.children[0], nodeB, 'c.children[0] === nodeB')
      t.equal(c.children[1], nodeA, 'c.children[1] === nodeA')
      t.end()
    })

    t.test('id match still morphs', (t) => {
      const a = html`<li id="12">FOO</li>`
      const b = html`<li id="12">BAR</li>`
      const target = b.outerHTML
      const c = morph(a, b)
      t.equal(c.outerHTML, target)
      t.end()
    })

    t.test('remove orphaned keyed nodes', (t) => {
      const a = html`
      <div>
        <div>1</div>
        <li id="a">a</li>
      </div>
    `
      const b = html`
      <div>
        <div>2</div>
        <li id="b">b</li>
      </div>
    `
      const expected = b.outerHTML
      const c = morph(a, b)
      t.equal(c.outerHTML, expected)
      t.end()
    })

    t.test('whitespace', (t) => {
      const a = html`<ul>
</ul>`
      const b = html`<ul><li></li><li></li>
</ul>`
      const expected = b.outerHTML
      const c = morph(a, b)
      t.equal(c.outerHTML, expected)
      t.end()
    })

    t.test('nested with id', (t) => {
      const child = html`<div id="child"></div>`
      const placeholder = html`<div id="child"></div>`
      placeholder.isSameNode = (el) => el === child

      const a = html`<div><div id="parent">${child}</div></div>`
      const b = html`<div><div id="parent">${placeholder}</div></div>`

      const c = morph(a, b)
      t.equal(c.children[0].children[0], child, 'is the same node')
      t.end()
    })

    t.test('nested without id', (t) => {
      const child = html`<div id="child">child</div>`
      const placeholder = html`<div id="child">placeholder</div>`
      placeholder.isSameNode = (el) => el === child

      const a = html`<div><div>${child}</div></div>`
      const b = html`<div><div>${placeholder}</div></div>`

      const c = morph(a, b)
      t.equal(c.children[0].children[0], child, 'is the same node')
      t.end()
    })
  })
}
