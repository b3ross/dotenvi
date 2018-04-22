#! /usr/bin/env node

import * as fs from 'fs';
import { ArgumentParser } from 'argparse';

import { Rewriter } from './rewriter';
import { ResolverMap, Document, InputDocument } from './types';
import { resolvers } from './resolvers';
import { writeFile, validateOutput } from './utils';
import { read } from './yamlReader';

const parser = new ArgumentParser();
parser.addArgument(['-s', '--stage'], {
  help: 'Environment stage',
  dest: 'stage'
});
const args = parser.parseArgs();


let document: InputDocument;
try {
  // TODO Load external resolvers
  document = read(args.stage);
} catch (error) {
  console.error(`Could not load yaml ${error.stack}`);
  process.exit(1);
}
const rewriter = new Rewriter(resolvers);
rewriter.rewrite(document).then(result => {
  const errors = validateOutput(document, result);
  if (errors.length) {
    throw new Error(`Validation errors found in result:\n${errors.join("\n")}`);
  }
  console.info(`Writing .env file to ${process.cwd()}/.env`);
  writeFile(result);
}).catch((error: Error) => {
  console.error(`Could not write .env file: ${error.stack}`);
  process.exit(1);
});
