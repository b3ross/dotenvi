#! /usr/bin/env node

import * as yaml from 'js-yaml';
import * as fs from 'fs';
import { ArgumentParser } from 'argparse';
import * as AWS from 'aws-sdk';
import { CloudFormation, Config } from 'aws-sdk';
import { DescribeStacksOutput } from 'aws-sdk/clients/cloudformation';

import { Parser } from './parse';
import { ResolverMap } from './types';

const resolvers: ResolverMap = {
  cft: async (argument: string) => {
    if (!AWS.config.region) {
      AWS.config.update({ region: 'us-east-1' });
    }
    const cft = new CloudFormation();
    const parsedArgument = argument.split('.', 2);
    let stack: DescribeStacksOutput;
    try {
      stack = await cft.describeStacks({ StackName: parsedArgument[0] }).promise();
    } catch (e) {
      throw new Error(
        `Could not get info for stack with name ${parsedArgument[0]} when parsing cft reference ${argument}: ${e}`
      );
    }
    for (const output of stack.Stacks[0].Outputs) {
      if (output.OutputKey === parsedArgument[1]) {
        return output.OutputValue;
      }
    }
    throw new Error(`Could not locate output ${parsedArgument[1]} of stack ${parsedArgument[0]}`);
  },
  env: async (argument: string) => {
    return process.env[argument];
  },
  constant: async (argument: string) => {
    return argument;
  }
};

const parser = new ArgumentParser();
parser.addArgument(['-s', '--stage'], {
  help: 'Environment stage',
  dest: 'stage'
});
parser.addArgument(['file'], {
  help: 'env.yml file'
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

  let document = yaml.safeLoad(fs.readFileSync(args.file, 'utf8'));
  if (args.stage) {
    document = (document as any)[args.stage];
    if (!document) {
      throw new Error(`Could not locate stage ${args.stage} in file ${args.file}`);
    }
  }
  const parser = new Parser(resolvers);
  parser.parse(document).then(result => {
    writeFile(result);
  });
} catch (e) {
  console.error(`Could not load yaml ${e}`);
}
