/* eslint-disable no-param-reassign, no-multi-assign, no-plusplus */

// a bit modified, keyed version, almost working
const domdiff = require('./domdiff');
const events = require('./events');

/**
 * Helpers
 */

const NO_SUFFIX = /acit|ex(?:s|g|n|p|$)|rph|ows|mnc|ntw|ine[ch]|zoo|^ord/i;

function isSameTextNodes(left, right) {
  return isTextNode(left) && isTextNode(right) && isEqualText(left, right);
}

function isTextNode(val) {
  return val && val.nodeType === 3;
}

function isEqualText(left, right) {
  return right.nodeValue === left.nodeValue;
}

function decamelize(str) {
  return str
    .replace(/([a-z\d])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z\d]+)/g, '$1-$2')
    .toLowerCase();
}

/**
 * left: old node
 * right: new node
 */

function minmorph(left, right) {
  if (!left) {
    return right;
  } else if (!right) {
    return null;
  } else if (right.isSameNode && right.isSameNode(left)) {
    return left;
  } else if (left.nodeName !== right.nodeName) {
    return right;
  } else if (isSameTextNodes(left, right)) {
    return left;
  }

  const props = {};

  morph(left, right, props);
  morphChilds(left, right);
  morphEvents(left, right);

  return left;
}

module.exports = minmorph;

function morphEvents(left, right) {
  for (let i = 0; i < events.length; i++) {
    const ev = events[i];
    if (right[ev]) {
      // if new element has a whitelisted attribute
      left[ev] = right[ev]; // update existing element
    } else if (left[ev]) {
      // if existing element has it and new one doesnt
      left[ev] = undefined; // remove it from existing element
    }
  }
}

/**
 * Here we are sure that `left` and `right` exist and
 * they are the same tag names `<div>` and `<div>`.
 *
 * @param {*} left
 * @param {*} right
 */

function morph(left, right, props) {
  // if Element Node
  if (right.nodeType === 1) {
    morphProps(left, right, props);
  }

  if (left.nodeName === 'INPUT') {
    updateInput(left, right);
  }
  if (left.nodeName === 'OPTION') {
    updateProp(left, right, 'selected');
  }
  if (left.nodeName === 'TEXTAREA') {
    updateTextarea(left, right);
  }

  return left;
}

function morphProps(left, right, props) {
  for (let j = 0; j < left.attributes.length; j++) {
    const attr = left.attributes[j];
    props[attr.name] = {
      name: attr.name,
      value: attr.value,
      ns: attr.namespaceURI,
    };
  }

  for (let i = 0; i < right.attributes.length; i++) {
    const attrNode = right.attributes[i];
    const attrValue = attrNode.value;
    const attrName = attrNode.name;

    // important: always `null` by default, or actual namespace!
    // so just use it instead of checking and using both
    // the `(set|get|has)AttributeNS` and `(set|get|has)Attribute` methods.
    const ns = attrNode.namespaceURI;

    morphAttribute({ left, right }, props, {
      ns,
      attrName,
      attrValue,
      attrNode,
    });
  }

  /* eslint-disable-next-line no-restricted-syntax, guard-for-in */
  for (const name in props) {
    const oldAttr = props[name];
    if (!right.attributes[name] && !name.startsWith('on')) {
      left.removeAttributeNS(oldAttr.ns, name);
    }
  }
}

/**
 * Important notes from here on:
 * - `.nodeName` is always uppercase, no matter of the browser?!
 *
 * @param {any} { left, right }
 * @param {any} props - the left attribute nodes cache
 * @param {any} opts
 */
function morphAttribute({ left, right }, props, opts) {
  if (opts.attrName === 'style') {
    updateStyle({ left, right }, props, opts);
  } else if (!opts.attrName.startsWith('on')) {
    updateAttribute({ left, right }, props, opts);
  }
}

/**
 * Supports both camelCased and dash-cased style props
 * like style={{ fontSize: 12 }} and style={{ 'font-size': 33 }}
 *
 * @param {any} { left, right }
 * @param {any} props
 * @param {any} opts
 */
function updateStyle({ left, right }, props, opts) {
  const { attrName, attrValue, attrNode } = opts;

  // hint: `attrName` is "style"
  if (!(attrValue && props[attrName].value !== right.style.cssText)) return;

  /* eslint-disable no-param-reassign */
  if (typeof attrValue === 'object') {
    let cssText = '';

    /* eslint-disable no-restricted-syntax, guard-for-in */
    for (const k in attrValue) {
      let val = attrValue[k];

      // if the value of the style property, e.g.
      // <div style={{ fontSize: 12 }} /> and div style={{ fontSize: 55 }} />
      // values 12 and 55 are not equal, right?
      if (left.style[k] !== val) {
        const suffix = typeof val === 'number' && NO_SUFFIX.test(k) === false;

        val = suffix ? `${val}px` : val;
        cssText += `${decamelize(k)}:${val};`;

        left.style[k] = val;

        left.style.cssText = attrNode.value = cssText;

        // left.attributes.style is `Attribute` object too!!
        // so the `.value` is same as `left.style.cssText`.
        // Update the cache of oldProps a.k.a `props` here of `left`

        left.attributes.style.value = props[attrName].value = cssText;
      }
    }
  } else {
    left.style.cssText = String(attrValue);
  }
}

function updateAttribute({ left }, props, opts) {
  const { attrName, attrValue, ns } = opts;
  const oldProp = props[attrName];
  const hasIn = attrName in props;

  if (!hasIn) {
    setAttr({ left }, props, opts);
  } else if (hasIn && oldProp.value !== attrValue) {
    if (attrValue === 'null' || attrValue === 'undefined') {
      left.removeAttributeNS(ns, attrName);
      delete props[attrName];
    } else {
      setAttr({ left }, props, opts);
    }
  }
}

function setAttr({ left }, props, opts) {
  const { attrName, attrValue, ns } = opts;
  left.setAttributeNS(ns, attrName, attrValue);

  props[attrName] = props[attrName] || {};
  props[attrName].value = attrValue;
  props[attrName].ns = ns;
  return left;
}

function updateInput(left, right) {
  updateProp(left, right, 'value');
  updateProp(left, right, 'checked');
  updateProp(left, right, 'disabled');

  if (right.value === 'null') {
    left.removeAttribute('value');
    left.value = '';
  }

  if (!right.hasAttributeNS(null, 'value')) {
    left.removeAttribute('value');
  } else if (left.type === 'range') {
    // this is so elements like slider move their UI thingy
    left.value = right.value;
  }
}

function updateProp(left, right, name) {
  if (left[name] !== right[name]) {
    left[name] = right[name];

    if (right[name]) {
      left.setAttribute(name, '');
    } else {
      left.removeAttribute(name);
      // delete left[name]
    }
  }
}

function updateTextarea(left, right) {
  updateProp(left, right, 'value');

  const firstChild = left.childNodes[0];
  if (firstChild && firstChild.nodeValue !== right.value) {
    // Needed for IE. Apparently IE sets the placeholder as the
    // node value and vise versa. This ignores an empty update.
    if (right.value === '' && firstChild.nodeValue === left.placeholder) {
      return;
    }

    firstChild.nodeValue = right.value;
  }
}

function morphChilds(left, right) {
  domdiff(minmorph, left, [...left.childNodes], [...right.childNodes]);
}
