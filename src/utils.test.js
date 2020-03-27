const { validateOutput } = require('./utils');

describe('validateOutput', () => {
  it('Validates successful output', () => {
    const input = {
      variable: {
        value: 'constant'
      },
      optional: {
        value: undefined,
        optional: true
      }
    };
    const output = {
      variable: 'constant'
    };
    const errors = validateOutput(input, output);
    expect(errors.length).toBe(0);
  });

  it('Errors if output null and required', () => {
    const input = {
      environment: {
        value: '${env:this_should_not_be_defined}'
      }
    };
    const output = {};
    const errors = validateOutput(input, output);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('Does not error if output null and optional', () => {
    const input = {
      environment: {
        value: '${env:this_should_not_be_defined}',
        optional: true
      }
    };
    const output = {};
    const errors = validateOutput(input, output);
    expect(errors.length).toBe(0);
  });
});
