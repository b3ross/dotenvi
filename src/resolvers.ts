import * as AWS from 'aws-sdk';
import { Stack, DescribeStacksOutput } from 'aws-sdk/clients/cloudformation';

const Credstash = require('aws-credstash');

import { promisify } from 'bluebird';

import { ResolverMap, Config } from './types';
import { accessNestedObject } from './utils';

const stackCache: Map<string, any> = new Map();

// Single shared instantiation of aws-sdk clients - exported for test access
export const cft = new AWS.CloudFormation();
export const asm = new AWS.SecretsManager();

export const resolvers: ResolverMap = {
  cft: async (argument: string, config: Config) => {
    const parsedArgument = argument.split('.', 2);

    let stack: Stack = stackCache.get(parsedArgument[0]);

    if (!stack) {
      if (!AWS.config.region) {
        AWS.config.update({ region: config.awsRegion });
      }
      let describeStack: DescribeStacksOutput;
      try {
        describeStack = await cft.describeStacks({ StackName: parsedArgument[0] }).promise();
      } catch (e) {
        console.warn(
          `Could not get info for stack with name ${parsedArgument[0]} when parsing cft reference ${argument}: ${e}`
        );
        return undefined;
      }
      if (describeStack.Stacks.length == 0) {
        console.warn(`Could not locate stack with name ${parsedArgument[0]} when parsing cft reference ${argument}`);
        return undefined;
      }
      stack = describeStack.Stacks[0];
      stackCache.set(parsedArgument[0], stack);
    }

    for (const output of stack.Outputs) {
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
  },
  asm: async (argument: string) => {
    const params = argument.split('.');
    const [secretId, ...jsonMappings] = params;

    if (!secretId) {
      console.warn('No id provided to aws secret manager resolver');
      return undefined;
    }

    try {
      const { SecretString } = await asm.getSecretValue({ SecretId: secretId }).promise();

      if (jsonMappings.length) {
        const parseJson = JSON.parse(SecretString);

        const lookupSecretValue = accessNestedObject(parseJson, jsonMappings);

        if (!lookupSecretValue) {
          console.warn(`No aws secret manager value found for ${secretId}`);
          return undefined;
        }

        return lookupSecretValue;
      }

      return SecretString;
    } catch (e) {
      console.warn(e.message);
      return undefined;
    }
  }
};
