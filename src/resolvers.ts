import * as AWS from 'aws-sdk';
import { CloudFormation } from 'aws-sdk';
import { DescribeStacksOutput } from 'aws-sdk/clients/cloudformation';

const Credstash = require('nodecredstash');

import { promisify } from 'bluebird';

import { ResolverMap, Config } from './types';

export const resolvers: ResolverMap = {
  cft: async (argument: string, config: Config) => {
    if (!AWS.config.region) {
      AWS.config.update({ region: config.awsRegion });
    }
    const cft = new CloudFormation();
    const parsedArgument = argument.split('.', 2);
    let stack: DescribeStacksOutput;
    try {
      stack = await cft.describeStacks({ StackName: parsedArgument[0] }).promise();
    } catch (e) {
      console.warn(
        `Could not get info for stack with name ${parsedArgument[0]} when parsing cft reference ${argument}: ${e}`
      );
      return undefined;
    }
    if (stack.Stacks.length == 0) {
      console.warn(`Could not locate stack with name ${parsedArgument[0]} when parsing cft reference ${argument}`);
      return undefined;
    }

    for (const output of stack.Stacks[0].Outputs) {
      if (output.OutputKey === parsedArgument[1]) {
        return output.OutputValue;
      }
    }
    console.warn(`Could not locate output ${parsedArgument[1]} of stack ${parsedArgument[0]}`);
    return undefined;
  },
  env: async (argument: string) => {
    if (!process.env[argument]) {
      console.warn(`Environment variable ${argument} is undefined`);
    }
    return process.env[argument];
  },
  constant: async (argument: string) => {
    return argument;
  },
  cred: async (argument: string, config: Config) => {
    const credstash = new Credstash({ awsOpts: { region: config.awsRegion } });
    const promisified = promisify<string, object>(credstash.getSecret, { context: credstash });
    return promisified({ name: argument }).catch((error: Error): string => {
      console.warn(`Could not load value ${argument} from credstash: ${error}`);
      return undefined;
    });
  }
};
