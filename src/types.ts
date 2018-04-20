export type ResolverMap = { [name: string]: (arg: string) => Promise<string> };
export type Document = { [name: string]: string }
