const { Rewriter } = require('./rewriter');
const { resolvers } = require('./resolvers');

describe('Rewriter', () => {
  it('Rewrites constants', () => {
    const document = {
      explicit: {
        value: '${constant:hello}'
      },
      implicit: {
        value: 'hello'
      }
    };

    const rewriter = new Rewriter({ resolvers: resolvers });
    return rewriter.rewrite(document).then(output => {
      expect(output['explicit']).toBe(output['implicit']);
    });
  });

  it('Rewrites environment variables', () => {
    process.env['TEST'] = 'hello';
    const document = {
      test: {
        value: '${env:TEST}'
      }
    };

    const rewriter = new Rewriter({ resolvers: resolvers });
    return rewriter.rewrite(document).then(output => {
      expect(output['test']).toBe('hello');
    });
  });

  it('Rewrites variables with surrounding strings', () => {
    process.env['TEST'] = 'hello';
    const document = {
      test: {
        value: 'test-${env:TEST}-test'
      }
    };

    const rewriter = new Rewriter({ resolvers: resolvers });
    return rewriter.rewrite(document).then(output => {
      expect(output['test']).toBe('test-hello-test');
    });
  });

  it('Handles recursive rewrites', () => {
    process.env['RECURSIVE_OUTER'] = '${env:RECURSIVE_INNER}';
    process.env['RECURSIVE_INNER'] = 'test';
    const document = {
      test: {
        value: '${env:RECURSIVE_OUTER}'
      }
    };

    const rewriter = new Rewriter({ resolvers: resolvers });
    return rewriter.rewrite(document).then(output => {
      expect(output['test']).toBe('test');
    });
  });

  it('Handles complex recursive rewrites', () => {
    process.env['RECURSIVE_OUTER2'] = '${env:RECURSIVE_MIDDLE2}-test';
    process.env['RECURSIVE_MIDDLE2'] = 'foo${env:RECURSIVE_INNER2}bar${env:RECURSIVE_INNER2}';
    process.env['RECURSIVE_INNER2'] = 'test';
    const document = {
      test: {
        value: '${env:RECURSIVE_OUTER2}'
      }
    };

    const rewriter = new Rewriter({ resolvers: resolvers });
    return rewriter.rewrite(document).then(output => {
      expect(output['test']).toBe('footestbartest-test');
    });
  });

  it('Supports optionals', () => {
    const document = {
      test: {
        value: '${env:OPTIONAL}',
        optional: true
      }
    };

    const rewriter = new Rewriter({ resolvers: resolvers });
    return rewriter.rewrite(document).then(output => {
      expect(output['test']).toBe('');
    });
  });

  it("Doesn't blow up with bad references like ${FOO} or {FOO} or {FOO or FOO}", () => {
    process.env['BAD_REFERENCE'] = 'BAD_REFERENCE';
    const document = {
      with_dollar: {
        value: '${FOO}'
      },
      without_dollar: {
        value: '{FOO}'
      },
      with_left_curly_only: {
        value: '{FOO'
      },
      with_right_curly_only: {
        value: 'FOO}'
      }
    };

    const rewriter = new Rewriter({ resolvers: resolvers });
    return rewriter.rewrite(document).then(output => {
      for (key in document) {
        expect(output[key]).toBe(document[key]['value']);
      }
    });
  });

  it('Handles full alphanumeric resolver', () => {
    const document = {
      test: {
        value: '${1custom_Uppercaser:lowercase}'
      }
    };

    const customUppercaser = async value => value.toUpperCase();

    const rewriter = new Rewriter({ resolvers: { ...resolvers, '1custom_Uppercaser': customUppercaser } });
    return rewriter.rewrite(document).then(output => {
      expect(output['test']).toBe('LOWERCASE');
    });
  });
});
