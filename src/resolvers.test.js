const { resolvers } = require('./resolvers');

const awsSecretManagerResolver = resolvers.aws;

describe('AWS Resolver', () => {
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
      expect(output).toBe(undefined);
    });
  });

  it('returns undefined if json string mapper invalid', () => {
    return awsSecretManagerResolver('jsonString.invalid').then(output => {
      expect(output).toBe(undefined);
    });
  });

  it('returns undefined if json key string invalid', () => {
    return awsSecretManagerResolver('invalidJsonString.invalid').then(output => {
      expect(output).toBe(undefined);
    });
  });
});
