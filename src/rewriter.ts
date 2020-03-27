import { Document, InputDocument, Config, Primitive } from './types';

export class Rewriter {
  constructor(private config: Config) {}

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
      let result = '';
      let capture = '';

      for (let i = 0; i < value.length; ++i) {
        const c = value.charAt(i);
        if (c === '$') {
          capture += c;
        } else if (c == '}') {
          capture += c;
          const regex = new RegExp('\\${([a-z]+):(.*)}');
          const matchResults = capture.match(regex);
          const resolverName = matchResults && matchResults[1];
          const resolver = this.getResolver(resolverName);
          if (!resolver) {
            throw new Error(`Could not locate resolver for value ${value}`);
          }
          const argument = matchResults ? matchResults[2] : value;
          let resolved = await resolver(argument, this.config);
          const rewrittenValue = await this.rewriteValue(resolved);
          if (rewrittenValue) {
            result += rewrittenValue;
          }
          capture = '';
        } else if (capture) {
          capture += c;
        } else {
          result += c;
        }
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
