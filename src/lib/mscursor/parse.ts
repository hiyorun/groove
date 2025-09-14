import type { CursorFile, CursorEntry } from './types';

export async function parseCur(file: File | Blob): Promise<CursorFile> {
  const buffer = await file.arrayBuffer();
  const view = new DataView(buffer);

  const cursors: CursorFile = {
    entries: []
  }
  const count = view.getUint16(4, true);

  let offset = 6;
  for (let i = 0; i < count; i++) {
    if (offset + 16 > buffer.byteLength) {
      throw new Error('Invalid .cur file: truncated directory');
    }

    const entry: CursorEntry = {
      width: new Uint8Array(buffer, offset, 1)[0] || 256,
      height: new Uint8Array(buffer, offset + 1, 1)[0] || 256,
      colors: new Uint8Array(buffer, offset + 2, 1)[0],
      reserved: new Uint8Array(buffer, offset + 3, 1)[0],
      hotspotX: view.getUint16(offset + 4, true),
      hotspotY: view.getUint16(offset + 6, true),
      size: view.getUint16(offset + 8, true),
      imageOffset: view.getUint16(offset + 12, true),
      imageData: new ArrayBuffer(0),
    };

    // Extract image data
    if (entry.imageOffset + entry.size > buffer.byteLength) {
      throw new Error('Invalid .cur file: image data out of bounds');
    }

    entry.imageData = buffer.slice(entry.imageOffset, entry.imageOffset + entry.size);
    cursors.entries.push(entry);
    offset += 16;
  }

  return cursors;
}

async function verifyMagic(view: DataView): Promise<Error | null> {
  const reserved = view.getUint16(0, true);
  const type = view.getUint16(2, true);

  if (reserved !== 0 || type !== 2) {
    return new Error('Not a valid .cur file');
  }

  return null;
}

export async function identCur(file: File | Blob): Promise<boolean> {
  const buffer = await file.arrayBuffer();
  const view = new DataView(buffer);

  return (await verifyMagic(view)) === null;
}
