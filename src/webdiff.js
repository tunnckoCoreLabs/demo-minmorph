/* eslint-disable max-statements, no-plusplus, eqeqeq, max-depth, max-params, no-param-reassign */

/**
 * This code is a revisited port of the snabbdom vDOM diffing logic,
 * the same that fuels as fork Vue.js or other libraries.
 * @credits https://github.com/snabbdom/snabbdom
 */

// NodeList.prototype.indexOf = function indexOf (elem) {
//   let k = -1

//   for (let i = 0; i < this.length; i++) {
//     if (this[i] && this[i] == elem) {
//       k = i
//       break
//     }
//   }

//   return k
// }

const identity = function identity (O) {
  return O
}

export default function domdiff (
  parentNode, // where changes happen
  currentNodes, // Array of current items/nodes
  futureNodes, // Array of future items/nodes
  getNode, // optional way to retrieve a node from an item
  minmorph // optional item/node to use as insertBefore delimiter
) {
  const get = getNode || identity
  // const before = beforeNode == null ? null : get(beforeNode, 0)

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
    } else if (
      same(currentStartNode, futureStartNode) /* currentStartNode == futureStartNode */
    ) {
      currentStartNode = currentNodes[++currentStart]
      futureStartNode = futureNodes[++futureStart]
    } else if (currentEndNode == futureEndNode) {
      currentEndNode = currentNodes[--currentEnd]
      futureEndNode = futureNodes[--futureEnd]
    } else if (
      same(currentStartNode, futureEndNode) /* currentStartNode == futureEndNode */
    ) {
      parentNode.insertBefore(
        get(currentStartNode, 1),
        get(currentEndNode, -0).nextSibling
      )
      currentStartNode = currentNodes[++currentStart]
      futureEndNode = futureNodes[--futureEnd]
    } else if (
      same(currentEndNode, futureStartNode) /* currentEndNode == futureStartNode */
    ) {
      parentNode.insertBefore(get(currentEndNode, 1), get(currentStartNode, 0))
      currentEndNode = currentNodes[--currentEnd]
      futureStartNode = futureNodes[++futureStart]
    } else {
      const index = currentNodes.indexOf(futureStartNode)

      if (index < 0) {
        parentNode.insertBefore(get(futureStartNode, 1), get(currentStartNode, 0))
        futureStartNode = futureNodes[++futureStart]
      } else {
        currentNodes[index] = null
        parentNode.insertBefore(get(currentNodes[index], 1), get(currentStartNode, 0))
        futureStartNode = futureNodes[++futureStart]
      }
    }
  }
  if (currentStart <= currentEnd || futureStart <= futureEnd) {
    if (currentStart > currentEnd) {
      const pin = futureNodes[futureEnd + 1]
      const place = pin == null ? null : get(pin, 0)
      if (futureStart === futureEnd) {
        parentNode.insertBefore(get(futureNodes[futureStart], 1), place)
      } else {
        const fragment = parentNode.ownerDocument.createDocumentFragment()
        while (futureStart <= futureEnd) {
          fragment.appendChild(get(futureNodes[futureStart++], 1))
        }
        parentNode.insertBefore(fragment, place)
      }
    } else {
      if (currentNodes[currentStart] == null) {
        currentStart++
      }
      if (currentStart === currentEnd) {
        parentNode.removeChild(get(currentNodes[currentStart], -1))
      } else {
        const range = parentNode.ownerDocument.createRange()
        range.setStartBefore(get(currentNodes[currentStart], -1))
        range.setEndAfter(get(currentNodes[currentEnd], -1))
        range.deleteContents()
      }
    }
  }
  return futureNodes
}

function same (left, right) {
  const nextKey = getKey(right)
  if (nextKey) return nextKey === getKey(left)

  if (right.isSameNode) return right.isSameNode(left)
  if (right.nodeName === left.nodeName) return true
  // if (right == left) return true

  return false
}

function getKey (node) {
  if (!node) return null

  return node.key || (node.attributes && node.attributes.key) || node.id
}
