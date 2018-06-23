/* eslint-disable no-underscore-dangle */

const nanomorph = require('nanomorph');
const minmorph = require('../src/index');
const abstractMorph = require('./test-morph');
const abstractKeyed = require('./test-keyed');
const abstractFuzz = require('./test-fuzz');
const abstractEvents = require('./test-events');

/**
 * MINmorph
 */

// 719 of 724 passing
// because exactly 2 `keyed` tests
minmorph.__name = 'minMorph';

/**
 * NANO MORPH
 */

// 620 of 724 passing
// because some `events` tests
nanomorph.__name = 'nanomorph';

/**
 * RUN TESTS
 */

// 31 of 31 passing
abstractMorph(minmorph);

// 422 of 422 passing
abstractFuzz(minmorph);

// 249 of 249 passing
abstractEvents(minmorph);

// 17 of 22 passing
abstractKeyed(minmorph);
