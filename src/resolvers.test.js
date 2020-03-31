const { resolvers } = require('./resolvers');

const awsSecretManagerResolver = resolvers.asm;

describe('AWS Resolver', () => {
  let consoleOutput = [];
  const mockedWarn = output => consoleOutput.push(output);
  beforeEach(() => (console.warn = mockedWarn));

  it('returns json secret value', () => {
    return awsSecretManagerResolver('jsonString.foo').then(output => {
      expect(output).toBe('bar');
    });
  });

  it('returns single string secret value', () => {
    return awsSecretManagerResolver('singleString').then(output => {
      expect(output).toBe('foobar');
    });
  });

  it('returns undefined if single string invalid', () => {
    return awsSecretManagerResolver('invalidSingleString').then(output => {
      expect(consoleOutput).toMatchSnapshot();
      expect(output).toBe(undefined);
    });
  });

  it('returns undefined if json string mapper invalid', () => {
    return awsSecretManagerResolver('jsonString.invalid').then(output => {
      expect(consoleOutput).toMatchSnapshot();
      expect(output).toBe(undefined);
    });
  });

  it('returns undefined if json key string invalid', () => {
    return awsSecretManagerResolver('invalidJsonString.invalid').then(output => {
      expect(consoleOutput).toMatchSnapshot();
      expect(output).toBe(undefined);
    });
  });
});
