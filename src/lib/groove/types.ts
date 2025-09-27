export type Collection = {
  name: string;
  author: string;
  version: number;
  cursors: Cursor[];
};

export type Cursor = {
  name: string;
  version: number;
  hotspot: CursorHotspot;
  sizes: SizeGroups;
};

export type CursorHotspot = {
  x: number;
  y: number;
};

export type SizeGroups = Map<number, Definition>;

export type Definition = {
  frames: Frame[];
  useUnifiedDelay?: boolean;
  unifiedDelay?: number;
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
