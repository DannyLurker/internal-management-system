export type Issue = {
  code: string;
  path: (string | number)[];
  message: string;
  expected?: string;
  keys?: string[];
};
