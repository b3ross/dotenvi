import { ResolverMap, Document } from './types';

export class Rewriter {
  constructor(private resolvers: ResolverMap) { }

  async rewrite(document: Document): Promise<Document> {
    const variables = Object.keys(document);
    const result: Document = {};
    for (const variable of variables) {
      const value = document[variable];
      result[variable] = await this.rewriteValue(value);
    }
    return result;
  }

  private async rewriteValue(value: string): Promise<string> {
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
