#! /usr/bin/env node

import * as yaml from 'js-yaml';
import * as fs from 'fs';
import { ArgumentParser } from 'argparse';

import { Rewriter } from './rewriter';
import { ResolverMap, Document } from './types';
import { resolvers } from './resolvers';
import { validateDocument, writeFile } from './utils';

const parser = new ArgumentParser();
parser.addArgument(['-s', '--stage'], {
  help: 'Environment stage',
  dest: 'stage'
});
const args = parser.parseArgs();


let document;
try {
  // TODO Load external resolvers
  document = yaml.safeLoad(fs.readFileSync('./env.yml', 'utf8')) as Document;
  if (args.stage) {
    document = (document as any)[args.stage];
    if (!document) {
      throw new Error(`Could not locate stage ${args.stage} in file ${args.file}`);
    }
  }

  const errors = validateDocument(document);
  if (errors.length) {
    throw new Error(`Validation errors found while loading document.  Did you forget to specify -s?:
${JSON.stringify(errors, undefined, 2)}`);
  }
} catch (error) {
  console.error(`Could not load yaml ${error.stack}`);
  process.exit(1);
}
const rewriter = new Rewriter(resolvers);
rewriter.rewrite(document).then(result => {
  console.info(`Writing .env file to ${process.cwd()}/.env`);
  writeFile(result);
}).catch((error: Error) => {
  console.error(`Could not write .env file: ${error.stack}`);
  process.exit(1);
});
