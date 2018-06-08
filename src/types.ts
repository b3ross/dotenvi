export type ResolverFunction = (arg: string, config: Config) => Promise<string>;
export type ResolverMap = {
  [name: string]: ResolverFunction
};

export type Primitive = string | number | boolean;
export type Document = { [name: string]: Primitive }

export class InputDocument {
  [name: string]: {
    value: Primitive;
    optional?: boolean
  }
}

export class Config {
  constructor() {
    this.resolvers = {};
    this.awsRegion = 'us-east-1';
  }
  awsRegion: string;
  resolvers: ResolverMap
}
