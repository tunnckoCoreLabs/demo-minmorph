/* eslint-disable max-statements, no-plusplus, eqeqeq, max-depth */

const identity = (x) => x

NodeList.prototype.indexOf = function indexOf (elem) {
  /* eslint-disable no-param-reassign */

  let k = -1

  for (let i = 0; i < this.length; i++) {
    if (this[i] && this[i] === elem) {
      k = i
      break
    }
  }

  return k
}

const timestamp = Date.now()

export default function mindiff (prev, next, getNode) {
  const get = getNode || identity
  const before = null

  // const left = prev.cloneNode(true)
  // const right = next.cloneNode(true)
  const currentChilds = Array.from(prev.childNodes)
  const currentNodes = prev.childNodes
  const futureNodes = next.childNodes

  // const currentChilds = Array.prototype.slice.call(currentNodes)

  // const foobar = false

  let currentStart = 0
  let futureStart = 0
  let currentEnd = currentNodes.length - 1
  let currentStartNode = currentNodes[0]
  let currentEndNode = currentNodes[currentEnd]
  let futureEnd = futureNodes.length - 1
  let futureStartNode = futureNodes[0]
  let futureEndNode = futureNodes[futureEnd]

  while (currentStart <= currentEnd && futureStart <= futureEnd) {
    if (currentStartNode == null) {
      currentStartNode = currentNodes[++currentStart]
    } else if (currentEndNode == null) {
      currentEndNode = currentNodes[--currentEnd]
    } else if (futureStartNode == null) {
      futureStartNode = futureNodes[++futureStart]
    } else if (futureEndNode == null) {
      futureEndNode = futureNodes[--futureEnd]
    } else if (currentStartNode == futureStartNode) {
      currentStartNode = currentNodes[++currentStart]
      futureStartNode = futureNodes[++futureStart]
    } else if (currentEndNode == futureEndNode) {
      currentEndNode = currentNodes[--currentEnd]
      futureEndNode = futureNodes[--futureEnd]
    } else if (
      /* same(currentStartNode, futureEndNode) */ currentStartNode == futureEndNode
    ) {
      prev.insertBefore(get(currentStartNode, 1), get(currentEndNode, -0).nextSibling)
      currentStartNode = currentNodes[++currentStart]
      futureEndNode = futureNodes[--futureEnd]
    } else if (
      /* same(currentEndNode, futureStartNode) */ currentEndNode == futureStartNode
    ) {
      prev.insertBefore(get(currentEndNode, 1), get(currentStartNode, 0))
      currentEndNode = currentNodes[--currentEnd]
      futureStartNode = futureNodes[++futureStart]
    } else {
      /**
       * INDEX OF
       */

      // let index = -1

      // for (let j = 0; j < currentNodes.length; j++) {
      //   if (same(currentNodes[j], futureStartNode)) {
      //     index = j
      //     break
      //   }
      // }
      // const clonedCurrentNodes = [].slice.call(currentNodes)
      const index = currentChilds.indexOf(futureStartNode)
      // const index = indexOf(currentNodes, futureStartNode)

      // const index = indexOf(futureStartNode)
      console.log('indx', index)

      if (index < 0) {
        prev.insertBefore(get(futureStartNode, 1), get(currentStartNode, 0))
        futureStartNode = futureNodes[++futureStart]
      } else {
        // const el = currentNodes[index]
        currentChilds[index] = null
        prev.insertBefore(get(currentNodes[index], 1), get(currentStartNode, 0))
        futureStartNode = futureNodes[++futureStart]
      }
    }
  }
  if (currentStart <= currentEnd || futureStart <= futureEnd) {
    if (currentStart > currentEnd) {
      const pin = futureNodes[futureEnd + 1]
      const place = pin == null ? before : get(pin, 0)

      if (futureStart === futureEnd) {
        prev.insertBefore(get(futureNodes[futureStart], 1), place)
      } else {
        const fragment = prev.ownerDocument.createDocumentFragment()

        while (futureStart <= futureEnd) {
          const futureNode = futureNodes[futureStart++]
          if (futureNode) {
            fragment.appendChild(get(futureNode, 1))
          }
        }

        prev.insertBefore(fragment, place)
      }
    } else {
      if (currentChilds[currentStart] == null) {
        currentStart++
      }
      if (currentStart === currentEnd) {
        prev.removeChild(get(currentNodes[currentStart], -1))
      } else {
        const range = prev.ownerDocument.createRange()
        range.setStartBefore(get(currentNodes[currentStart], -1))
        range.setEndAfter(get(currentNodes[currentEnd], -1))
        range.deleteContents()
      }
    }
  }
  return futureNodes
}

function same (left, right) {
  // if (!right || !left) return false

  const nextKey = getKey(right)
  if (nextKey) return nextKey === getKey(left)

  if (right.nodeType === 3) return right.nodeValue === left.nodeValue
  if (right.isSameNode) return right.isSameNode(left)
  if (right.nodeName === left.nodeName) return true
  if (right == left) return true
  return false
}

function getKey (node) {
  if (!node) return null

  return node.key || (node.attributes && node.attributes.key) || node.id
}
