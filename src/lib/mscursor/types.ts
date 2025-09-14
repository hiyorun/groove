export interface CursorEntry {
  width: number;
  height: number;
  colors: number;
  reserved: number;
  hotspotX: number;
  hotspotY: number;
  size: number;
  imageOffset: number;
  imageData: ArrayBuffer;
}

export interface CursorFile {
  entries: CursorEntry[];
}

export enum ImageFormat {
  BITMAP = 'bitmap',
  PNG = 'png',
  ICO = 'ico',
  UNKNOWN = 'unknown'
}

export interface ImageInfo {
  format: ImageFormat;
  needsConversion: boolean;
  mimeType: string;
}


