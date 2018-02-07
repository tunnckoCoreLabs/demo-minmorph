/**
 * @copyright 2017-present, Charlike Mike Reagent <olsten.larck@gmail.com>
 * @license Apache-2.0
 */

//
import fs from 'fs'
import path from 'path'
import util from 'util'
import asyncro from 'asyncro'
import prettyConfig from '@tunnckocore/pretty-config'

// TODO: prettyConfig should support `env` just like babel

const readPkg = async cwd => {
  const fp = path.resolve(cwd || process.cwd(), 'package.json')
  return util
    .promisify(fs.readFile)(fp, 'utf-8')
    .then(JSON.parse)
    .catch(() => {})
}

const tools = {
  babel: async opts => prettyConfig('babel', opts),
  buble: async opts => prettyConfig('buble', opts),
  // eslint: async (opts) => prettyConfig('eslint', opts),
  postcss: async opts => prettyConfig('postcss', opts),
  posthtml: async opts => prettyConfig('posthtml', opts),
  uglifyes: async opts => prettyConfig('uglifyes', opts),
  prettier: async opts => prettyConfig('prettier', opts),
}

const toolsDefaults = {
  babel: { xx: 1 },
  buble: {},
  // eslint: {},
  postcss: {},
  posthtml: {},
  uglifyes: {},
  prettier: {
    xx: 'zzz',
    tabWidth: 4,
  },
}

const defaults = {
  port: 5000,
}

async function rolldown(options) {
  const settings = await prettyConfig('rolldown', options)
  const opts = Object.assign({}, defaults, settings, options)
  const pkg = await readPkg(opts.cwd)

  await asyncro.reduce(
    Object.keys(tools),
    async (acc, name) => {
      const cfg = await tools[name](opts)
      acc[name] = Object.assign({}, toolsDefaults[name], opts[name], cfg)
      return acc
    },
    opts
  )

  console.log(opts)
}

rolldown()

export default rolldown
