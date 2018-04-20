#! /usr/bin/env node

import * as yaml from 'js-yaml';
import * as fs from 'fs';
import { ArgumentParser } from 'argparse';

import { Rewriter } from './rewriter';
import { ResolverMap, Document } from './types';
import { resolvers } from './resolvers';

const parser = new ArgumentParser();
parser.addArgument(['-s', '--stage'], {
  help: 'Environment stage',
  dest: 'stage'
});
const args = parser.parseArgs();

function writeFile(document: { [name: string]: string }) {
  let output = '';
  const variables = Object.keys(document);
  for (const variable of variables) {
    output += `${variable}=${document[variable]}\n`;
  }
  fs.writeFileSync('.env', output);
}

try {
  // TODO Load external resolvers

  let document = yaml.safeLoad(fs.readFileSync('./env.yml', 'utf8')) as Document;
  if (args.stage) {
    document = (document as any)[args.stage];
    if (!document) {
      throw new Error(`Could not locate stage ${args.stage} in file ${args.file}`);
    }
  }
  const rewriter = new Rewriter(resolvers);
  rewriter.rewrite(document).then(result => {
    console.info(`Writing .env file to ${process.cwd()}/.env`);
    writeFile(result);
  });
} catch (e) {
  console.error(`Could not load yaml ${e}`);
}
