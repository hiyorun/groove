import type { CursorHandler, Cursor, SizeGroups, Definition, Frame } from '@/lib/groove';
import { identHlc, makeHlc, parseHlc, type HyprCursor } from '@/lib/hyprcursor';

export const hyprcursorHandler: CursorHandler = {
  async parse(file: File): Promise<Cursor> {
    const cursor = await parseHlc(file);

    const sizeGroups: SizeGroups = new Map();

    cursor.define_size.forEach((frame) => {
      let definition: Definition | undefined;
      if (!sizeGroups.has(frame.size)) {
        definition = {
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
      console.log(definition, frame.file.url);
    });

    const name = file.name.endsWith('.hlc') ? file.name.slice(0, -4) : file.name;
    return {
      name: name,
      version: 1,
      hotspot: {
        x: cursor.hotspot_x,
        y: cursor.hotspot_y,
      },
      sizes: sizeGroups,
    };
  },
  async make(cursor: Cursor): Promise<[Blob, string]> {
    const hyprCursor: HyprCursor = {
      hotspot_x: Math.round(cursor.hotspot.x * 100) / 100,
      hotspot_y: Math.round(cursor.hotspot.y * 100) / 100,
      nominal_size: 1,
      resize_algorithm: 'none',
      define_override: [],
      define_size: [],
    };

    cursor.sizes.forEach((definition: Definition, size: number) => {
      definition.frames.forEach((frame: Frame, index: number) => {
        hyprCursor.define_size.push({
          size: frame.width,
          delay: frame.delay,
          file: {
            name: `${cursor.name}-${size}-${index}.png`,
            url: frame.url,
          },
        });
      });
    });
    const hlc = await makeHlc(hyprCursor);
    const packageName = cursor.name.endsWith('.hlc') ? cursor.name : `${cursor.name}.hlc`;
    return [hlc, packageName];
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
