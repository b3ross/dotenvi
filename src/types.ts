export type ResolverFunction = (arg: string, config: Config) => Promise<string>;
export type ResolverMap = {
  [name: string]: ResolverFunction;
};

export type Format = 'dotenv' | 'json';
export type Primitive = string | number | boolean;
export type Document = { [name: string]: Primitive };
export type GenericObject = { [key: string]: any };

export class InputDocument {
  [name: string]: {
    value: Primitive;
    optional?: boolean;
  };
}

export class Config {
  constructor() {
    this.resolvers = {};
    this.awsRegion = process.env.AWS_REGION || 'us-east-1';
  }
  awsRegion: string;
  resolvers: ResolverMap;
}
