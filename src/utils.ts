import * as fs from 'fs';
import * as os from 'os';

import { Document, InputDocument, Config, GenericObject, Format } from './types';
import { resolvers } from './resolvers';

export function writeFile(document: Document, filename: string, format: Format) {
  let output = '';
  if (format === 'dotenv') {
    const keys = Object.keys(document);
    for (const key of keys) {
      if (document[key] !== undefined) {
        output += `${key}=${document[key]}\n`;
      }
    }
  }
  else if (format === 'json') {
    output = JSON.stringify(document, undefined, 2) + os.EOL;
  }
  else {
    throw new Error(`Invalid output format specified ${format}`);
  }

  fs.writeFileSync(filename, output);
}

export function validateOutput(input: InputDocument, output: Document): string[] {
  const errors = [];
  const keys = Object.keys(input);
  for (const key of keys) {
    if (!input[key].optional) {
      if (!(key in output) || output[key] === undefined || output[key] === '') {
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

export function accessNestedObject(nestedObj: GenericObject, pathArr: string[]) {
  return pathArr.reduce((obj: GenericObject, key: string) =>
    obj && obj[key] ? obj[key] : undefined, nestedObj);
}

export function parseFormat(format: string): Format {
  if (format.toLowerCase() === "dotenv") {
    return 'dotenv';
  } else if (format.toLowerCase() === "json") {
    return 'json';
  }
  throw new Error(`Invalid format specified ${format}`);
}
