import type { CursorHandler, Cursor, SizeGroups, Definition } from '@/lib/groove';
import { floatPrecise } from '@/lib/groove/helper';
import { CursorImageConverter, identCur, parseCur } from '@/lib/mscursor';

export const mscursorHandler: CursorHandler = {
  async parse(file: File): Promise<Cursor> {
    const parsed = await parseCur(file);

    const largest = parsed.entries.reduce((a, b) => (a.width > b.width ? a : b));

    const relXhot = floatPrecise(largest.hotspotX / largest.width);
    const relYhot = floatPrecise(largest.hotspotY / largest.height);

    const sizeGroups: SizeGroups = new Map();
    const assetConvert = new CursorImageConverter();

    for (const entry of parsed.entries) {
      const url = assetConvert.cursorToImageURL(entry);

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
    console.log('Unimplemented!', cursor);
    const file = new File([], '');
    return [file, ''];
  },
  async ident(file: File): Promise<boolean> {
    return await identCur(file);
  },
};
