import type { CursorFile } from './types';

export function makeCur(cursor: CursorFile): ArrayBuffer {
  if (!Array.isArray(cursor.entries) || cursor.entries.length === 0) {
    throw new Error('At least one cursor is required');
  }

  const headerSize = 6;
  const directorySize = cursor.entries.length * 16;
  let totalImageSize = 0;

  for (const entry of cursor.entries) {
    if (!entry.imageData) throw new Error('Each cursor must have imageData');
    totalImageSize += entry.imageData.byteLength;
  }

  const totalSize = headerSize + directorySize + totalImageSize;
  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);

  // CUR Header
  view.setUint16(0, 0, true); // Reserved
  view.setUint16(2, 2, true); // Type = 2 (CUR)
  view.setUint16(4, cursor.entries.length, true);

  let entryOffset = headerSize;
  let imageOffset = headerSize + directorySize;

  for (const entry of cursor.entries) {
    // Directory entry
    bytes[entryOffset] = entry.width === 256 ? 0 : entry.width;
    bytes[entryOffset + 1] = entry.height === 256 ? 0 : entry.height;
    bytes[entryOffset + 2] = entry.colors || 0;
    bytes[entryOffset + 3] = entry.reserved || 0;

    view.setUint16(entryOffset + 4, entry.hotspotX || 0, true);
    view.setUint16(entryOffset + 6, entry.hotspotY || 0, true);
    view.setUint32(entryOffset + 8, entry.imageData.byteLength, true);
    view.setUint32(entryOffset + 12, imageOffset, true);

    // Copy image data
    bytes.set(new Uint8Array(entry.imageData), imageOffset);

    entryOffset += 16;
    imageOffset += entry.imageData.byteLength;
  }

  return buffer;
}
