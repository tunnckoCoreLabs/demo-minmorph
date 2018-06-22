/* eslint-disable no-underscore-dangle */

const nanomorph = require('nanomorph')
const minmorph = require('../index')
const abstractMorph = require('./test-morph') // 31/31 passing
const abstractKeyed = require('./test-keyed') // 15/19 passing
const abstractFuzz = require('./test-fuzz') // 422/422 passing
const abstractEvents = require('./test-events') // 31/93 passing

/**
 * MINmorph
 */

minmorph.__name = 'minMorph' // 499/565 passing

/**
 * NANO MORPH
 */

nanomorph.__name = 'nanomorph' // 565/565 passing

/**
 * RUN TESTS
 */

abstractMorph(minmorph)
abstractKeyed(minmorph)
abstractFuzz(minmorph)
abstractEvents(minmorph)
