import type { CursorHandler, Cursor, SizeGroups, Definition } from '@/lib/groove';
import { floatPrecise } from '@/lib/groove/helper';
import {
  cursorToImageURL,
  identCur,
  makeCur,
  parseCur,
  pngToDIB,
  type CursorEntry,
  type CursorFile,
} from '@/lib/mscursor';

export const mscursorHandler: CursorHandler = {
  async parse(file: File): Promise<Cursor> {
    const parsed = await parseCur(file);

    const largest = parsed.entries.reduce((a, b) => (a.width > b.width ? a : b));

    const relXhot = floatPrecise(largest.hotspotX / largest.width);
    const relYhot = floatPrecise(largest.hotspotY / largest.height);

    const sizeGroups: SizeGroups = new Map();

    for (const entry of parsed.entries) {
      const url = cursorToImageURL(entry);

      const def: Definition = {
        frames: [
          {
            width: entry.width,
            height: entry.height,
            delay: 0,
            url: url,
          },
        ],
      };

      sizeGroups.set(entry.width, def);
    }

    const name = file.name.endsWith('.cur') ? file.name.slice(0, -4) : file.name;
    return {
      name: name,
      version: 1,
      hotspot: {
        x: relXhot,
        y: relYhot,
      },
      sizes: sizeGroups,
    };
  },
  async make(cursor: Cursor): Promise<[Blob, string]> {
    const mscursor: CursorFile = {
      entries: [],
    };

    for (const [size, definition] of cursor.sizes.entries()) {
      for (const frame of definition.frames) {
        const response = await fetch(frame.url);
        const buffer = await response.arrayBuffer();

        const entry: CursorEntry = {
          width: size,
          height: size,
          colors: 0,
          reserved: 0,
          hotspotX: cursor.hotspot.x,
          hotspotY: cursor.hotspot.y,
          size: buffer.byteLength,
          imageOffset: 0,
          imageData: await pngToDIB(buffer),
        };

        mscursor.entries.push(entry);
      }
    }

    const buffer = makeCur(mscursor);
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    const packageName = cursor.name.endsWith('.cur') ? cursor.name : `${cursor.name}.cur`;
    return [blob, packageName];
  },
  async ident(file: File): Promise<boolean> {
    return await identCur(file);
  },
};
