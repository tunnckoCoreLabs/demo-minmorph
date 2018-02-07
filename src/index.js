/* eslint-disable no-param-reassign, no-multi-assign, no-plusplus, max-lines */

/**
 * Helpers
 */

const NO_SUFFIX = /acit|ex(?:s|g|n|p|$)|rph|ows|mnc|ntw|ine[ch]|zoo|^ord/i

function isSameTextNodes (left, right) {
  return isTextNode(left) && isTextNode(right) && isEqualText(left, right)
}

function isTextNode (val) {
  return val && val.nodeType === 3
}

function isEqualText (left, right) {
  return right.nodeValue === left.nodeValue
}

function decamelize (str) {
  return str
    .replace(/([a-z\d])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z\d]+)/g, '$1-$2')
    .toLowerCase()
}

/**
 * left: old node
 * right: new node
 */

export default patch

function patch (left, right) {
  if (!left) {
    return right
  } else if (!right) {
    return null
  } else if (left.nodeName !== right.nodeName) {
    return right
  } else if (isTextNode(right) && !isEqualText(left, right)) {
    return right
  } else if (
    (right.isSameNode && right.isSameNode(left)) ||
    isSameTextNodes(left, right)
  ) {
    return left
  }
  // probably not needed
  // if (isTextNode(left) && isTextNode(right) && isEqualText(left, right)) {
  //   return left
  // }

  const props = {}
  diff(left, right, props)
  morphChilds(left, right)

  return left
}

/**
 * Here we are sure that `left` and `right` exist and
 * they are the same tag names `<div>` and `<div>`.
 *
 * @param {*} left
 * @param {*} right
 */

function diff (left, right, props) {
  // if Element Node
  if (right.nodeType === 1) {
    morphProps(left, right, props)
  }

  // if Text Nodes
  if (right.nodeType === 3) {
    left.nodeValue = right.nodeValue
  }

  if (left.nodeName === 'INPUT') {
    updateInput(left, right)
  }
  if (left.nodeName === 'OPTION') {
    updateProp(left, right, 'selected')
  }
  if (left.nodeName === 'TEXTAREA') {
    updateTextarea(left, right)
  }

  return left
}

function morphProps (left, right, props) {
  for (let j = 0; j < left.attributes.length; j++) {
    const attr = left.attributes[j]
    props[attr.name] = {
      name: attr.name,
      value: attr.value,
      ns: attr.namespaceURI,
    }
  }

  for (let i = 0; i < right.attributes.length; i++) {
    const attrNode = right.attributes[i]
    const attrValue = attrNode.value
    const attrName = attrNode.name

    // important: always `null` by default, or actual namespace!
    // so just use it instead of checking and using both
    // the `(set|get|has)AttributeNS` and `(set|get|has)Attribute` methods.
    const ns = attrNode.namespaceURI

    morphAttribute({ left, right }, props, {
      ns,
      attrName,
      attrValue,
      attrNode,
    })
  }

  // eslint-disable-next-line
  for (const name in props) {
    const oldAttr = props[name]
    if (!right.attributes[name]) {
      left.removeAttributeNS(oldAttr.ns, name)
    }
  }
}

/**
 * Important notes from here on:
 * - `.nodeName` is always uppercase, no matter of the browser?!
 *
 * @param {any} { left, right }
 * @param {any} props
 * @param {any} opts
 */
function morphAttribute ({ left, right }, props, opts) {
  if (opts.attrName === 'style') {
    updateStyle({ left, right }, props, opts)
  } else {
    updateAttribute({ left }, props, opts)
  }
}

/**
 *
 *
 * @param {any} { left, right }
 * @param {any} props
 * @param {any} opts
 */
function updateStyle ({ left, right }, props, opts) {
  const { attrName, attrValue, attrNode } = opts

  // hint: `attrName` is "style"
  if (!(attrValue && props[attrName].value !== right.style.cssText)) return

  /* eslint-disable no-param-reassign */
  if (typeof attrValue === 'object') {
    let cssText = ''

    /* eslint-disable no-restricted-syntax, guard-for-in */
    for (const k in attrValue) {
      let val = attrValue[k]

      // if the value of the style property, e.g.
      // <div style={{ fontSize: 12 }} /> and div style={{ fontSize: 55 }} />
      // values 12 and 55 are not equal, right?
      if (left.style[k] !== val) {
        const suffix = typeof val === 'number' && NO_SUFFIX.test(k) === false

        val = suffix ? `${val}px` : val
        cssText += `${decamelize(k)}:${val};`

        left.style[k] = val

        left.style.cssText = attrNode.value = cssText

        // left.attributes.style is `Attribute` object too!!
        // so the `.value` is same as `left.style.cssText`.
        // Update the cache of oldProps a.k.a `props` here of `left`

        left.attributes.style.value = props[attrName].value = cssText
      }
    }
  } else {
    left.style.cssText = String(attrValue)
  }
}

function updateAttribute ({ left }, props, opts) {
  const { attrName, attrValue, ns } = opts
  const oldProp = props[attrName]
  const hasIn = attrName in props

  if (!hasIn) {
    setAttr({ left }, props, opts)
  }
  if (hasIn && oldProp.value !== attrValue) {
    if (attrValue === 'null' || attrValue === 'undefined') {
      left.removeAttributeNS(ns, attrName)
      delete props[attrName] // eslint-disable-line no-param-reassign
    } else {
      setAttr({ left }, props, opts)
    }
  }
}

function setAttr ({ left }, props, opts) {
  const { attrName, attrValue, ns } = opts

  left.setAttributeNS(ns, attrName, attrValue)

  props[attrName] = props[attrName] || {}
  props[attrName].value = attrValue
  props[attrName].ns = ns
  return left
}

function updateInput (left, right) {
  updateProp(left, right, 'value')
  updateProp(left, right, 'checked')
  updateProp(left, right, 'disabled')

  if (right.value === 'null') {
    left.removeAttribute('value')
    left.value = ''
  }

  if (!right.hasAttributeNS(null, 'value')) {
    left.removeAttribute('value')
  } else if (left.type === 'range') {
    // this is so elements like slider move their UI thingy
    left.value = right.value
  }
}

function updateProp (left, right, name) {
  if (left[name] !== right[name]) {
    left[name] = right[name]

    // we don't use setAttribute and removeAttribute
    // because we already did that
    // in the `morphProps -> morphAttribute -> updateAttribute` step

    if (right[name]) {
      left.setAttribute(name, '')
    } else {
      left.removeAttribute(name)
      // delete left[name]
    }
  }
}

function updateTextarea (left, right) {
  updateProp(left, right, 'value')

  const firstChild = left.childNodes[0]
  if (firstChild && firstChild.nodeValue !== right.value) {
    // Needed for IE. Apparently IE sets the placeholder as the
    // node value and vise versa. This ignores an empty update.
    if (right.value === '' && firstChild.nodeValue === left.placeholder) {
      return
    }

    firstChild.nodeValue = right.value
  }
}

/* eslint-disable max-statements, max-depth */

function getKey (node) {
  if (!node) return null

  return node.key || (node.attributes && node.attributes.key) || node.id
}

function morphChilds (left, right) {
  let morphed = null
  let offset = 0

  const oldLen = left.childNodes.length
  const newLen = right.childNodes.length
  const fragment = left.ownerDocument.createDocumentFragment()

  // const keyed = {}
  // for (let i = 0; i < oldLen; i++) {
  //   const oldChild = left.childNodes[i]
  //   const oldKey = getKey(oldChild)

  //   if (oldKey) {
  //     keyed[oldKey] = oldChild
  //   }
  // }

  for (let j = 0; j <= newLen; j++) {
    if (j === newLen) {
      left.appendChild(fragment)
      break
    }

    const oldChild = left.childNodes[j]
    const newChild = right.childNodes[j - offset]

    if (!oldChild && !newChild) {
      break
    } else if (!oldChild && newChild) {
      fragment.appendChild(newChild)
      offset++
    } else if (oldChild && !newChild) {
      left.removeChild(oldChild)
    } else if (isTextNode(oldChild) && isTextNode(newChild)) {
      if (!isEqualText(oldChild, newChild)) {
        left.replaceChild(newChild, oldChild)
      }
    } else {
      morphed = patch(oldChild, newChild)
      if (morphed && morphed !== oldChild) {
        left.replaceChild(morphed, oldChild)
        offset++
      }
    }
  }

  if (newLen === 0) {
    const range = left.ownerDocument.createRange()
    range.selectNodeContents(left)
    range.deleteContents()

    // if (left.parentNode) {
    //   left.parentNode.replaceChild(right, left)
    // }
  }
}

// left: old node / right: new node
// function same (left, right) {
//   if (!right || !left) return false
//   if (right.id) return right.id === left.id
//   // if (right.nodeType === 3) return right.nodeValue === left.nodeValue
//   if (right.isSameNode) return right.isSameNode(left)
//   if (right.nodeName === left.nodeName) return true
//   return false
// }
