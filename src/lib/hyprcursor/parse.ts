import JSZip, { type JSZipObject } from 'jszip';
import type { HyprCursor } from './types';
import { parseMetaHl } from './meta';

export async function parseHlc(file: File | Blob): Promise<HyprCursor> {
  let zip, metaFile;
  try {
    [zip, metaFile] = await identHlc(file);
  } catch (err) {
    throw new Error(`${err}`);
  }

  const metaText = await metaFile.async('string');
  const meta = parseMetaHl(metaText);
  console.log(meta);

  await Promise.all(
    meta.define_size.map(async (val) => {
      const image = zip.file(val.file.name);
      if (!image) {
        console.warn('Missing image in zip:', val.file.name);
        return val;
      }

      const blob = await image.async('blob');
      const url = URL.createObjectURL(blob);

      val.file.url = url;
      return val;
    }),
  );

  return meta;
}

export async function identHlc(file: File | Blob): Promise<[JSZip, JSZipObject]> {
  let zip;
  try {
    zip = await JSZip.loadAsync(file);
  } catch (err) {
    throw new Error(`Failed to parse zip: ${err}`);
  }

  const metaFile = zip.file('meta.hl');
  if (!metaFile) {
    throw new Error('Can not find meta.hl inside the .hlc zip');
  }
  return [zip, metaFile];
}
