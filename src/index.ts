#! /usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { ArgumentParser } from 'argparse';

import { Rewriter } from './rewriter';
import { InputDocument, Format } from './types';
import { writeFile, validateOutput, loadConfig, parseFormat } from './utils';
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

parser.addArgument(['-o', '--output-dir'], {
  help: 'Output directory',
  dest: 'outputdir',
  defaultValue: process.cwd()
});

parser.addArgument(['-t', '--output-format'], {
  help: 'Output format of file.  Options are json or dotenv',
  dest: 'outputformat',
  defaultValue: 'dotenv'
});

const args = parser.parseArgs();
const config = loadConfig();

let document: InputDocument;
try {
  const contents = fs.readFileSync(args.file, 'utf8');
  document = parse(contents, args.stage);
} catch (error) {
  console.error(`Could not load yaml ${error.stack}`);
  process.exit(1);
}

const format = parseFormat(args.outputformat);
const filename = path.join(
  args.outputdir,
  args.outputformat === 'dotenv' ? '.env' : 'dotenvi.json');


const rewriter = new Rewriter(config);
rewriter
  .rewrite(document)
  .then(result => {
    const errors = validateOutput(document, result);
    if (errors.length) {
      throw new Error(`Validation errors found in result:\n${errors.join('\n')}`);
    }
    console.info(`Writing output file to ${filename}`);
    writeFile(result, filename, format);
  })
  .catch((error: Error) => {
    console.error(`Could not write output file: ${error.stack}`);
    process.exit(1);
  });
