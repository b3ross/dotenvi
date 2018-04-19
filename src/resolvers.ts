import * as AWS from 'aws-sdk';
import { CloudFormation, Config } from 'aws-sdk';
import { DescribeStacksOutput } from 'aws-sdk/clients/cloudformation';

import { ResolverMap } from './types';


export const resolvers: ResolverMap = {
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
    if (stack.Stacks.length == 0) {
      throw new Error(
        `Could not locate stack with name ${parsedArgument[0]} when parsing cft reference ${argument}`);
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
