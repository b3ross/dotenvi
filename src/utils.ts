import * as fs from 'fs';
import { Document, InputDocument } from './types';

export function writeFile(document: { [name: string]: string }) {
  let output = '';
  const keys = Object.keys(document);
  for (const key of keys) {
    if (document[key]) {
      output += `${key}=${document[key]}\n`;
    }
  }
  fs.writeFileSync('.env', output);
}


export function validateOutput(input: InputDocument, output: Document): string[] {
  const errors = [];
  const keys = Object.keys(input);
  for (const key of keys) {
    if (!input[key].optional) {
      if (!(key in output) || !(output[key])) {
        errors.push(`${key} is a required variable but is not specified in result`);
      }
    }
  }
  return errors;
}
