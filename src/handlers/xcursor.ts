import { parseXCursor, makeXCursor, identXCursor } from '@/lib/xcursor';
import type { CursorHandler, Cursor, SizeGroups } from '@/lib/groove';

export const xcursorHandler: CursorHandler = {
  async parse(file: File): Promise<Cursor> {
    const cursor = await parseXCursor(file);

    const sizeGroups: SizeGroups = new Map();

    const processed = await Promise.all(
      cursor.images.map(async (image, index) => {
        const canvas = document.createElement('canvas');
        canvas.width = image.imageData.width;
        canvas.height = image.imageData.height;

        const ctx = canvas.getContext('2d')!;
        ctx.putImageData(image.imageData, 0, 0);

        const blob = await new Promise<Blob>((res, rej) =>
          canvas.toBlob(
            (b) => (b ? res(b) : rej(new Error('Blob conversion failed'))),
            'image/png',
          ),
        );
        const url = URL.createObjectURL(blob);

        return {
          index,
          size: image.size,
          frame: {
            width: image.width,
            height: image.height,
            delay: image.delay,
            url,
          },
          xhot: image.xhot,
          yhot: image.yhot,
        };
      }),
    );

    processed.sort((a, b) => a.index - b.index);

    const largest = processed.reduce((a, b) => (a.size > b.size ? a : b));
    const relXhot = largest.xhot / largest.frame.width;
    const relYhot = largest.yhot / largest.frame.height;

    for (const { size, frame } of processed) {
      if (sizeGroups.has(size)) {
        sizeGroups.get(size)!.frames.push(frame);
      } else {
        sizeGroups.set(size, {
          frames: [frame],
        });
      }
    }

    return {
      name: file.name,
      version: cursor.version,
      hotspot: {
        x: relXhot,
        y: relYhot,
      },
      sizes: sizeGroups,
    };
  },
  async make(cursor: Cursor): Promise<[Blob, string]> {
    const images = await Promise.all(
      Array.from(cursor.sizes.entries())
        .flatMap(([size, definition]) =>
          definition.frames.map((frame, index) => ({ size, frame, index })),
        )
        .map(async ({ size, frame, index }) => {
          const img = new Image();
          img.src = frame.url;
          await img.decode();

          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;

          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, img.width, img.height);

          return {
            size,
            width: frame.width,
            height: frame.height,
            xhot: Math.round(cursor.hotspot.x * frame.width),
            yhot: Math.round(cursor.hotspot.y * frame.height),
            delay: frame.delay,
            imageData,
            index,
          };
        }),
    );

    images.sort((a, b) => {
      if (a.size !== b.size) return a.size - b.size;
      return a.index - b.index;
    });

    const buffer = makeXCursor(images, cursor.version);
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    return [blob, cursor.name];
  },

  async ident(file: File): Promise<boolean> {
    return await identXCursor(file);
  },
};
