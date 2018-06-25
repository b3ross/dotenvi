#! /usr/bin/env node

import * as fs from 'fs';
import { ArgumentParser } from 'argparse';

import { Rewriter } from './rewriter';
import { ResolverMap, Document, InputDocument } from './types';
import { resolvers } from './resolvers';
import { writeFile, validateOutput, loadConfig } from './utils';
import { parse } from './inputParser';

const parser = new ArgumentParser();
parser.addArgument(['-s', '--stage'], {
  help: 'Environment stage',
  dest: 'stage'
});
parser.addArgument(['-f', '--file'], {
  help: 'Path to env.yml',
  dest: 'file',
  defaultValue: 'env.yml'
});

const args = parser.parseArgs();
const config = loadConfig();

let document: InputDocument;
try {
  const contents = fs.readFileSync(args.file, 'utf8')
  document = parse(contents, args.stage);
} catch (error) {
  console.error(`Could not load yaml ${error.stack}`);
  process.exit(1);
}

const rewriter = new Rewriter(config);
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
