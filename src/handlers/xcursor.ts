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

    for (const { size, frame, xhot, yhot } of processed) {
      if (sizeGroups.has(size)) {
        sizeGroups.get(size)!.frames.push(frame);
      } else {
        sizeGroups.set(size, {
          xhot,
          yhot,
          frames: [frame],
        });
      }
    }

    return {
      name: file.name,
      version: cursor.version,
      sizes: sizeGroups,
    };
  },
  async make(cursor: Cursor): Promise<[Blob, string]> {
    const images = await Promise.all(
      Array.from(cursor.sizes.entries())
        .flatMap(([size, definition]) =>
          definition.frames.map((frame, index) => ({ size, definition, frame, index })),
        )
        .map(async ({ size, definition, frame, index }) => {
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
            xhot: definition.xhot,
            yhot: definition.yhot,
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
    return [blob, cursor.name]
  },

  async ident(file: File): Promise<boolean> {
    return await identXCursor(file);
  },
};
