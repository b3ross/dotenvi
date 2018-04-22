const { parse } = require('./inputParser');

describe('inputParser', () => {
  it('Parses valid document', () => {
    const contents = `
CONSTANT: constant
OPTIONAL:
  value: constant
  optional: true
`;
    const parsed = parse(contents);
  });

  it('Parses valid document with stage', () => {
    const contents = `
development:
  CONSTANT: constant
  OPTIONAL:
    value: constant
    optional: true
`;
    const parsed = parse(contents, 'development');
  });

  it('Parses invalid document', () => {
    const contents = `
development:
  CONSTANT: constant
  OPTIONAL:
    vlaue: constant
    optional: true
`;

    expect(() => {
      const parsed = parse(contents, 'development');
    }).toThrow();
  });

  it('Parses bad yaml', () => {
    const contents = `
development::: this is bad`;
    expect(() => {
      const parsed = parse(contents, 'development');
    }).toThrow();
  });
});
