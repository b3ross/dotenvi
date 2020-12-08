const { resolvers, cft } = require('./resolvers');

const asmSecretManagerResolver = resolvers.asm;
const cftResolver = resolvers.cft;

const AWS = require('aws-sdk');

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

describe('Cloudformation Output Resolver', () => {
  it('returns cft output value', () => {
    return cftResolver('testStack.foo').then(output => {
      expect(output).toBe('bar');
    });
  });

  it('calls to Cloudformation are cached', async () => {
    const startTimesCalled = cft.timesCalled;
    await cftResolver('newStack.foo');
    await cftResolver('newStack.bar');
    expect(cft.timesCalled - startTimesCalled).toBe(1);
    await cftResolver('differentStack.foo');
    expect(cft.timesCalled - startTimesCalled).toBe(2);
  });

  it('returns undefined when error is thrown', () => {
    return cftResolver('throwError.foo').then(output => {
      expect(output).toBe(undefined);
    });
  });

  it('returns undefined when stack is not found', () => {
    return cftResolver('notFound.foo').then(output => {
      expect(output).toBe(undefined);
    });
  });

  it('returns undefined when output is not found', () => {
    return cftResolver('outputMissing.foo').then(output => {
      expect(output).toBe(undefined);
    });
  });
});
