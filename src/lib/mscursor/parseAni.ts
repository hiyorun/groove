/**
 * Huge thanks to Webamp's ani-cursor:
 * https://github.com/captbaritone/webamp
 *
 * This parser wouldn’t exist without looking at their riffs.
 */

import { RIFFFile } from 'riff-file';
import { unpackArray } from 'byte-data';
import type { AniFile, AniEntry } from './types';
import { parseCur } from './parse';

type Chunk = {
  format: string;
  chunkId: string;
  chunkData: { start: number; end: number };
  subChunks: Chunk[];
};

const DWORD = { bits: 32, be: false, signed: false, fp: false };

export async function parseAni(file: File | Blob): Promise<AniFile> {
  const arr = new Uint8Array(await file.arrayBuffer());
  const riff = new RIFFFile();
  riff.setSignature(arr);

  const signature = riff.signature as Chunk;
  if (signature.format !== 'ACON') {
    throw new Error(`Expected ACON, got ${signature.format}`);
  }

  function mapChunk<T>(chunkId: string, mapper: (chunk: Chunk) => T): T | null {
    const chunk = riff.findChunk(chunkId) as Chunk | null;
    return chunk == null ? null : mapper(chunk);
  }

  function readImages(chunk: Chunk): Uint8Array[] {
    return chunk.subChunks
      .filter((c) => c.chunkId === 'icon')
      .map((c) => arr.slice(c.chunkData.start, c.chunkData.end));
  }

  const metadata = mapChunk('anih', (c) => {
    const words = unpackArray(arr, DWORD, c.chunkData.start, c.chunkData.end);
    return {
      cbSize: words[0],
      nFrames: words[1],
      nSteps: words[2],
      iWidth: words[3],
      iHeight: words[4],
      iBitCount: words[5],
      nPlanes: words[6],
      iDispRate: words[7],
      bfAttributes: words[8],
    };
  });

  if (!metadata) throw new Error('ANI missing anih chunk');

  const rates = mapChunk('rate', (c) =>
    unpackArray(arr, DWORD, c.chunkData.start, c.chunkData.end),
  );
  const seq = mapChunk('seq ', (c) => unpackArray(arr, DWORD, c.chunkData.start, c.chunkData.end));

  const lists = riff.findChunk('LIST', true) as Chunk[] | null;
  const imageChunk = lists?.find((c) => c.format === 'fram');
  if (!imageChunk) throw new Error('ANI missing fram LIST');

  const images = readImages(imageChunk);

  const steps = seq ?? images.map((_, i) => i);
  const entries: AniEntry[] = await Promise.all(
    steps.map(async (frameIndex, i) => {
      const img = images[frameIndex];
      const blob = new Blob([img], { type: 'image/x-icon' });
      const curFile = await parseCur(blob);
      const curEntry = curFile.entries[0];

      const rate = rates?.[i] ?? metadata.iDispRate ?? 10;

      const entry: AniEntry = {
        ...curEntry,
        size: img.byteLength,
        imageData: img.buffer,
        rate: Math.round(rate * (1000 / 60)),
        sequence: i,
      };
      return entry;
    }),
  );

  return {
    entries,
    defaultRate: metadata.iDispRate ?? 10,
  };
}

export async function identAni(file: File | Blob): Promise<boolean> {
  const buf = await file.slice(0, 12).arrayBuffer();
  const bytes = new Uint8Array(buf);

  const riff =
    bytes[0] === 0x52 // R
    && bytes[1] === 0x49 // I
    && bytes[2] === 0x46 // F
    && bytes[3] === 0x46; // F

  const acon =
    bytes[8] === 0x41 // A
    && bytes[9] === 0x43 // C
    && bytes[10] === 0x4f // O
    && bytes[11] === 0x4e; // N

  return riff && acon;
}
