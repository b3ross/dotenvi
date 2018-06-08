import * as fs from 'fs';

import { Document, InputDocument, Config } from './types';
import { resolvers } from './resolvers';

export function writeFile(document: Document) {
  let output = '';
  const keys = Object.keys(document);
  for (const key of keys) {
    if (document[key] !== undefined) {
      output += `${key}=${document[key]}\n`;
    }
  }
  fs.writeFileSync('.env', output);
}


export function validateOutput(input: InputDocument, output: Document): string[] {
  const errors = [];
  const keys = Object.keys(input);
  for (const key of keys) {
    if (!input[key].optional) {
      if (!(key in output) || output[key] === undefined) {
        errors.push(`${key} is a required variable but is not specified in result`);
      }
    }
  }
  return errors;
}


export function loadConfig(): Config {
  let config: Config = new Config();
  if (fs.existsSync(`./env.js`)) {
    console.info(`Loading configuration from ${process.cwd()}/env.js`);
    config = require(`${process.cwd()}/env`) as Config;
    if (!config.resolvers) {
      config.resolvers = {};
    }
  }
  config.resolvers = Object.assign({}, config.resolvers, resolvers);
  return config;
}
