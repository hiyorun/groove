import type { CursorHandler, Cursor, SizeGroups, Frame } from '@/lib/groove';
import { floatPrecise } from '@/lib/groove/helper';
import { identAni, makeAni, parseAni, pngToDIB } from '@/lib/mscursor';
import type { AniEntry, AniFile } from '@/lib/mscursor/types';
import JSZip from 'jszip';

export const msaniHandler: CursorHandler = {
  async parse(file: File): Promise<Cursor> {
    const cursor = await parseAni(file);

    const largest = cursor.entries.reduce((a, b) => (a.width > b.width ? a : b));

    const relXhot = floatPrecise(largest.hotspotX / largest.width);
    const relYhot = floatPrecise(largest.hotspotY / largest.height);

    const sizeGroups: SizeGroups = new Map();

    for (const entry of cursor.entries) {
      const bytes = new Uint8Array(entry.imageData);
      const base64 = window.btoa(String.fromCharCode(...bytes));
      const url = `data:image/x-icon;base64,${base64}`;

      const frame: Frame = {
        width: entry.width,
        height: entry.height,
        delay: entry.rate ?? cursor.defaultRate ?? 0,
        url,
      };

      if (!sizeGroups.has(entry.width)) {
        sizeGroups.set(entry.width, { frames: [] });
      }
      sizeGroups.get(entry.width)!.frames.push(frame);
    }

    const name = file.name.endsWith('.ani') ? file.name.slice(0, -4) : file.name;
    return {
      name,
      version: 1,
      hotspot: {
        x: relXhot,
        y: relYhot,
      },
      sizes: sizeGroups,
    };
  },
  async make(cursor: Cursor): Promise<[Blob, string]> {
    const aniSizeMap: Map<number, AniFile> = new Map();

    for (const [size, definition] of cursor.sizes.entries()) {
      const aniFile: AniFile = { entries: [] };
      for (const [index, frame] of definition.frames.entries()) {
        const response = await fetch(frame.url);
        const buffer = await response.arrayBuffer();

        const entry: AniEntry = {
          width: frame.width,
          height: frame.height,
          colors: 0,
          reserved: 0,
          hotspotX: cursor.hotspot.x,
          hotspotY: cursor.hotspot.y,
          size: size,
          imageOffset: 0,
          imageData: await pngToDIB(buffer),
          rate: frame.delay,
          sequence: index,
        };
        aniFile.entries.push(entry);
      }

      aniSizeMap.set(size, aniFile);
    }

    const zip = new JSZip();
    for (const [size, aniFile] of aniSizeMap) {
      const buffer = makeAni(aniFile);
      const blob = new Blob([buffer], { type: 'application/octet-stream' });
      const cursorName = `${size}-${cursor.name.endsWith('.ani') ? cursor.name : cursor.name + '.ani'}`;

      zip.file(cursorName, blob);
    }
    const packageName = `${cursor.name.endsWith('.ani') ? cursor.name.slice(0, -4) : cursor.name}`;
    const blob = await zip.generateAsync({ type: 'blob' })
    return [blob, packageName];
  },
  async ident(file: File): Promise<boolean> {
    return await identAni(file);
  },
};
