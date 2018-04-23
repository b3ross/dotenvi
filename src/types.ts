export type ResolverFunction = (arg: string, config: Config) => Promise<string>;
export type ResolverMap = {
  [name: string]: ResolverFunction
};
export type Document = { [name: string]: string }

export class InputDocument {
  [name: string]: {
    value: string;
    optional?: boolean
  }
}

export class Config {
  constructor() {
    this.resolvers = {};
    this.awsRegion = 'us-east-1';
  }
  awsRegion?: string;
  resolvers?: ResolverMap
}
