export interface XCursorImage {
  size: number
  width: number
  height: number
  xhot: number
  yhot: number
  delay: number
  imageData: ImageData
}

export interface XCursorImageMake extends XCursorImage {
  premultipliedImage: Uint32Array
}

export interface XCursorData {
  version: number
  images: XCursorImage[]
}
