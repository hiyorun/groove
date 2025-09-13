import JSZip from 'jszip';
import type { HyprCursor } from './types';
import { serializeMetaHl } from './meta';

export async function makeHlc(meta: HyprCursor): Promise<Blob> {
  const zip = new JSZip();

  const metaText = serializeMetaHl(meta);
  zip.file('meta.hl', metaText);

  await Promise.all(
    meta.define_size.map(async (def) => {
      if (!def.file.url) return;

      const res = await fetch(def.file.url);
      const blob = await res.blob();

      zip.file(def.file.name, blob);
    }),
  );

  return await zip.generateAsync({ type: 'blob' });
}
