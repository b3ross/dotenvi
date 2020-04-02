const { resolvers } = require('./resolvers');

const asmSecretManagerResolver = resolvers.asm;

describe('ASM Resolver', () => {
  it('returns json secret value', () => {
    return asmSecretManagerResolver('jsonString.foo').then(output => {
      expect(output).toBe('bar');
    });
  });

  it('returns nested json secret value', () => {
    return asmSecretManagerResolver('jsonString.nested.foo').then(output => {
      expect(output).toBe('bar');
    });
  });

  it('returns single string secret value', () => {
    return asmSecretManagerResolver('singleString').then(output => {
      expect(output).toBe('foobar');
    });
  });

  it('returns undefined if single string invalid', () => {
    return asmSecretManagerResolver('invalidSingleString').then(output => {
      expect(output).toBe(undefined);
    });
  });

  it('returns undefined if json string mapper invalid', () => {
    return asmSecretManagerResolver('jsonString.invalid').then(output => {
      expect(output).toBe(undefined);
    });
  });

  it('returns undefined if json key string invalid', () => {
    return asmSecretManagerResolver('invalidJsonString.invalid').then(output => {
      expect(output).toBe(undefined);
    });
  });
});
