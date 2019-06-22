import { Document, InputDocument, Config, Primitive } from './types';

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

  private async rewriteValue(value: Primitive): Promise<Primitive> {
    if (typeof value === 'string') {
      const regex = new RegExp('([^$]*)\\${([a-z]+):(.*)}(.*)');
      const matchResults = value.match(regex);
      const resolverName = matchResults && matchResults[2];
      const innerValue = matchResults ? matchResults[3] : value;
      const resolver = this.getResolver(resolverName);
      if (!resolver) {
        throw new Error(`Could not locate resolver for value ${value}`);
      }
      let result = await resolver(innerValue, this.config);
      // If there are surrounding strings, only rewrite if result is non-null
      if (result && matchResults) {
        result = matchResults[1] + result + matchResults[4]
      }
      return result;
    } else {
      return value;
    }
  }

  private getResolver(name: string) {
    if (!name) {
      return this.config.resolvers['constant'];
    }
    return this.config.resolvers[name];
  }
}
