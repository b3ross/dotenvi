import * as yaml from 'js-yaml';
import * as fs from 'fs';
import { InputDocument } from './types';

export function parse(contents: string, stage?: string): InputDocument {
  let document = yaml.safeLoad(contents) as any;
  if (stage) {
    document = (document as any)[stage];
    if (!document) {
      throw new Error(`Could not locate stage ${stage} in file env.yml`);
    }
  }
  const result = new InputDocument();
  const keys = Object.keys(document);
  for (const key of keys) {
    const value = document[key];
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      result[key] = { value: value };
    } else if (value.optional && typeof value.value !== 'undefined') {
      result[key] = {
        value: value.value,
        optional: value.optional,
      };
    } else {
      throw new Error(`Parse error reading document.  Invalid value: ${JSON.stringify(value)}`);
    }
  }
  return result;
}
