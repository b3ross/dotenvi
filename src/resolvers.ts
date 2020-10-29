import * as AWS from 'aws-sdk';
import { DescribeStacksOutput } from 'aws-sdk/clients/cloudformation';

const Credstash = require('aws-credstash');

import { promisify } from 'bluebird';

import { ResolverMap, Config } from './types';
import { accessNestedObject } from './utils';

export const resolvers: ResolverMap = {
  cft: async (argument: string, config: Config) => {
    if (!AWS.config.region) {
      AWS.config.update({ region: config.awsRegion });
    }
    const cft = new AWS.CloudFormation();
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
  },
  asm: async (argument: string) => {
    const params = argument.split('.');
    const [secretId, ...jsonMappings] = params;

    if (!secretId) {
      console.warn('No id provided to aws secret manager resolver');
      return undefined;
    }

    const client = new AWS.SecretsManager();

    try {
      const { SecretString } = await client
        .getSecretValue({ SecretId: secretId })
        .promise();

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
