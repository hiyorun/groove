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

export type SizeGroups = Map<number, Definition>;

export type Definition = {
  xhot: number;
  yhot: number;
  frames: Frame[];
};

export type FrameMetadata = {
  userAdded?: boolean;
  changed?: boolean;
};

export type Frame = {
  width: number;
  height: number;
  delay: number;
  url: string;
  _meta?: FrameMetadata;
};

export interface CursorHandler {
  parse(file: File | Blob): Promise<Cursor>;
  make(cursor: Cursor): Promise<[Blob, string]>;
  ident(file: File | Blob): Promise<boolean>;
}
