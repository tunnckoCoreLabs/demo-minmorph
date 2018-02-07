/* eslint-disable max-lines, max-statements, no-shadow, no-underscore-dangle */
import tape from 'tape'
import html from 'bel'

export default function abstractMorph (morph) {
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

    t.test(`diff name: ${morph.__name}`, (t) => {
      t.pass(`diff name: ${morph.__name}`)
      t.end()
    })
  })
}
