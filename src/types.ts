export type ResolverMap = { [name: string]: (arg: string) => Promise<string> };
export type Document = { [name: string]: string }


export class InputDocument {
  [name: string]: {
    value: string,
    optional?: boolean
  }
}
