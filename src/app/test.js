/* eslint-disable no-underscore-dangle */

import nanomorph from 'nanomorph'
import minmorph from '../index'
import abstractMorph from './test-normal' // 31/31 passing
import abstractKeyed from './test-keyed' // 15/19 passing
import abstractFuzz from './test-fuzz' // 422/422 passing
import abstractEvents from './test-events' // 31/93 passing

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
