import { ResolverMap } from './types';

export class Parser {
  constructor(private resolvers: ResolverMap) { }

  async parse(document: any): Promise<any> {
    const variables = Object.keys(document);
    const result = {};
    for (const variable of variables) {
      const value = document[variable];
      result[variable] = await this.parseValue(value);
    }
    return result;
  }

  private async parseValue(value: string): Promise<string> {
    // TODO Handle parsing embedded references
    const regex = new RegExp('\\${([a-z]+):(.*)}');
    const results = value.match(regex);
    const resolverName = results && results[1];
    const innerValue = results ? results[2] : value;
    const resolver = this.getResolver(resolverName);
    if (!resolver) {
      throw new Error(`Could not locate resolver for value ${value}`);
    }
    const result = await resolver(innerValue);
    return result;
  }

  private getResolver(name: string) {
    if (!name) {
      return this.resolvers['constant'];
    }
    return this.resolvers[name];
  }
}
