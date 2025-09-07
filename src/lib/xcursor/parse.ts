import type { XCursorData, XCursorImage } from './types';

export async function parseXCursor(file: File | Blob): Promise<XCursorData> {
  const buffer = await file.arrayBuffer();
  const view = new DataView(buffer);

  const err = verifyMagic(view);
  if (err) {
    throw new Error("There's a problem verifying XCursor Magic: " + err);
  }

  // const headerSize = view.getUint32(4, true)
  const version = view.getUint32(8, true);
  const tocCount = view.getUint32(12, true);

  const images: XCursorImage[] = [];

  for (let i = 0; i < tocCount; i++) {
    const offset = 16 + i * 12;
    const type = view.getUint32(offset, true);
    const pos = view.getUint32(offset + 8, true);

    if (type === 0xfffd0002) {
      const image = parseImageChunk(view, pos);
      images.push(image);
    }
    // Skips other chunk types like comments, etc.
  }

  return { version, images };
}

function verifyMagic(view: DataView): Error | null {
  const expected = [0x58, 0x63, 0x75, 0x72]; // 'Xcur'
  for (let i = 0; i < expected.length; i++) {
    if (view.getUint8(i) !== expected[i]) {
      return new Error('Invalid Xcursor file (bad magic)');
    }
  }
  return null;
}

function parseImageChunk(view: DataView, pos: number): XCursorImage {
  const chunkSub = view.getUint32(pos + 8, true);

  const width = view.getUint32(pos + 16, true);
  const height = view.getUint32(pos + 20, true);
  const xhot = view.getUint32(pos + 24, true);
  const yhot = view.getUint32(pos + 28, true);
  const delay = view.getUint32(pos + 32, true);

  const imageData = new ImageData(width, height);
  let pixelOffset = pos + 36;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const argb = view.getUint32(pixelOffset, true);
      const a = (argb >>> 24) & 0xff;
      const r = (argb >>> 16) & 0xff;
      const g = (argb >>> 8) & 0xff;
      const b = argb & 0xff;

      const idx = (y * width + x) * 4;
      imageData.data[idx + 0] = r;
      imageData.data[idx + 1] = g;
      imageData.data[idx + 2] = b;
      imageData.data[idx + 3] = a;

      pixelOffset += 4;
    }
  }

  return {
    size: chunkSub,
    width,
    height,
    xhot,
    yhot,
    delay,
    imageData,
  };
}

export async function identXCursor(file: File | Blob): Promise<boolean> {
  const buffer = await file.arrayBuffer();
  const view = new DataView(buffer);

  return verifyMagic(view) === null;
}
