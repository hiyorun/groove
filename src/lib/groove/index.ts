export type Collection = {
  name: string;
  author: string;
  version: number;
  cursors: Cursor[];
};

export type Cursor = {
  name: string;
  version: number;
  sizes: SizeGroups;
};

export type SizeGroups = Map<number, Definition>

export type Definition = {
  xhot: number;
  yhot: number;
  frames: Frame[];
};

export type Frame = {
  width: number;
  height: number;
  delay: number;
  url: string;
};

export interface CursorHandler {
  parse(file: File | Blob): Promise<Cursor>;
  make(cursor: Cursor): Promise<Blob>;
  ident(file: File | Blob): Promise<boolean>;
}
