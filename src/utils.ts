import * as fs from 'fs';

export function writeFile(document: { [name: string]: string }) {
  let output = '';
  const keys = Object.keys(document);
  for (const key of keys) {
    output += `${key}=${document[key]}\n`;
  }
  fs.writeFileSync('.env', output);
}

export function validateDocument(document: any): string[] {
  const errors = [];
  const keys = Object.keys(document);
  for (const key of keys) {
    if (typeof document[key] !== 'string') {
      errors.push(`${key} has an invalid value ${JSON.stringify(document[key])}`);
    }
  }
  return errors;
}
