import type { XCursorImage, XCursorImageMake } from './types'

function premultiplyAlpha(rgbaPixels: Uint8ClampedArray): Uint32Array {
  const count = rgbaPixels.length / 4
  const argbPixels = new Uint32Array(count)
  for (let i = 0; i < count; i++) {
    const r = rgbaPixels[i * 4 + 0]
    const g = rgbaPixels[i * 4 + 1]
    const b = rgbaPixels[i * 4 + 2]
    const a = rgbaPixels[i * 4 + 3]
    const pr = Math.floor((r * a) / 255)
    const pg = Math.floor((g * a) / 255)
    const pb = Math.floor((b * a) / 255)
    argbPixels[i] = (a << 24) | (pr << 16) | (pg << 8) | pb
  }
  return argbPixels
}

export function makeXCursor(images: Array<XCursorImage>, version: number): ArrayBuffer {
  const XCURSOR_MAGIC = 0x72756358 // 'Xcur'
  const FILE_HEADER_SIZE = 16
  const TOC_ENTRY_SIZE = 12
  const CHUNK_HEADER_SIZE = 16
  const IMAGE_METADATA_SIZE = 20
  const IMAGE_TYPE = 0xfffd0002
  const IMAGE_VERSION = 1

  const nimages = images.length
  let totalSize = FILE_HEADER_SIZE + nimages * TOC_ENTRY_SIZE
  const imagePremultiplied = images.map((val) => {
    const data = premultiplyAlpha(val.imageData.data)
    const premultiplied: XCursorImageMake = {
      ...val,
      premultipliedImage: data,
    }
    return premultiplied
  })

  for (const image of imagePremultiplied) {
    totalSize += CHUNK_HEADER_SIZE + IMAGE_METADATA_SIZE + image.premultipliedImage.byteLength
  }

  const buffer = new ArrayBuffer(totalSize)
  const view = new DataView(buffer)
  let offset = 0

  // File Header
  view.setUint32(offset, XCURSOR_MAGIC, true)
  offset += 4
  view.setUint32(offset, FILE_HEADER_SIZE, true) // header size in bytes, NOT words
  offset += 4
  view.setUint32(offset, version, true)
  offset += 4
  view.setUint32(offset, nimages, true)
  offset += 4

  // TOC
  let chunkOffset = FILE_HEADER_SIZE + nimages * TOC_ENTRY_SIZE
  for (const image of imagePremultiplied) {
    view.setUint32(offset, IMAGE_TYPE, true)
    offset += 4
    view.setUint32(offset, image.size, true)
    offset += 4
    view.setUint32(offset, chunkOffset, true)
    offset += 4

    chunkOffset += CHUNK_HEADER_SIZE + IMAGE_METADATA_SIZE + image.premultipliedImage.byteLength
  }

  // Image Chunks
  for (const image of imagePremultiplied) {
    const chunkSize = CHUNK_HEADER_SIZE + IMAGE_METADATA_SIZE + image.premultipliedImage.byteLength
    view.setUint32(offset, chunkSize, true)
    offset += 4
    view.setUint32(offset, IMAGE_TYPE, true)
    offset += 4
    view.setUint32(offset, image.size, true)
    offset += 4
    view.setUint32(offset, IMAGE_VERSION, true)
    offset += 4

    view.setUint32(offset, image.width, true)
    offset += 4
    view.setUint32(offset, image.height, true)
    offset += 4
    view.setUint32(offset, image.xhot, true)
    offset += 4
    view.setUint32(offset, image.yhot, true)
    offset += 4
    view.setUint32(offset, image.delay, true)
    offset += 4

    // Write pixels as raw ARGB (Uint32Array)
    new Uint8Array(buffer, offset).set(new Uint8Array(image.premultipliedImage.buffer))
    offset += image.premultipliedImage.byteLength
  }

  return buffer
}
