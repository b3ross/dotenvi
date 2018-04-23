import { Document, InputDocument, Config } from './types';

export class Rewriter {
  constructor(private config: Config) { }

  async rewrite(document: InputDocument): Promise<Document> {
    const variables = Object.keys(document);
    const result: Document = {};
    for (const variable of variables) {
      const value = document[variable].value;
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
    const result = await resolver(innerValue, this.config);
    return result;
  }

  private getResolver(name: string) {
    if (!name) {
      return this.config.resolvers['constant'];
    }
    return this.config.resolvers[name];
  }
}
