import type { CursorHandler, Cursor, SizeGroups, Definition } from '@/lib/groove';
import { identHlc, parseHlc } from '@/lib/hyprcursor/parse';

export const hyprcursorHandler: CursorHandler = {
  async parse(file: File): Promise<Cursor> {
    const cursor = await parseHlc(file);

    const sizeGroups: SizeGroups = new Map();

    cursor.define_size.forEach((frame) => {
      let definition: Definition | undefined;
      if (!sizeGroups.has(frame.size)) {
        definition = {
          xhot: Math.floor(frame.size * cursor.hotspot_x),
          yhot: Math.floor(frame.size * cursor.hotspot_y),
          frames: [],
        };
        sizeGroups.set(frame.size, definition);
      }
      definition = sizeGroups.get(frame.size);
      if (definition === undefined) throw new Error(`sizeGroups ${frame.size} is not defined yet`);
      definition.frames.push({
        width: frame.size,
        height: frame.size,
        delay: frame.delay,
        url: frame.file.url,
      });
      sizeGroups.set(frame.size, definition);
      console.log(definition, frame.file.url)
    });

    return {
      name: file.name,
      version: 1,
      sizes: sizeGroups,
    };
  },
  async make(cursor: Cursor): Promise<Blob> {
    console.log('Unimplemented!', cursor);
    return new Blob();
  },

  async ident(file: File): Promise<boolean> {
    try {
      await identHlc(file);
      return true;
    } catch {
      return false;
    }
  },
};
