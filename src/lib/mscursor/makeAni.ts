import { makeCur } from './make';
import type { AniFile, AniMetadata } from './types';

function writeDWORD(view: DataView, offset: number, value: number) {
  view.setUint32(offset, value, true);
  return offset + 4;
}

function writeChars(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  return offset + str.length;
}

function padEven(n: number) {
  return n % 2 === 0 ? n : n + 1;
}

export function makeAni(ani: AniFile): ArrayBuffer {
  // CUR buffers for each entry
  const curFrames = ani.entries.map((entry) => {
    return new Uint8Array(makeCur({ entries: [entry] }));
  });

  let totalSize = 4; // 'ACON'
  totalSize += 8 + 36; // anih chunk
  totalSize += 8 + ani.entries.length * 4; // rate chunk
  totalSize += 8 + ani.entries.length * 4; // seq chunk
  totalSize += 4 + 4 + 4; // LIST header + size + 'fram'

  curFrames.forEach((cur) => {
    totalSize += 4 + 4 + cur.byteLength; // 'icon' + size + data
    totalSize = padEven(totalSize);
  });

  const buffer = new ArrayBuffer(totalSize + 8);
  const view = new DataView(buffer);
  let offset = 0;

  offset = writeChars(view, offset, 'RIFF');
  offset = writeDWORD(view, offset, totalSize);
  offset = writeChars(view, offset, 'ACON');

  offset = writeChars(view, offset, 'anih');
  offset = writeDWORD(view, offset, 36);
  const metadata: AniMetadata = {
    cbSize: 36,
    nFrames: ani.entries.length,
    nSteps: ani.entries.length,
    iWidth: 0,
    iHeight: 0,
    iBitCount: 32,
    nPlanes: 1,
    iDispRate: ani.defaultRate || 10,
    bfAttributes: 0,
  };
  for (const key of Object.keys(metadata)) {
    offset = writeDWORD(view, offset, metadata[key as keyof AniMetadata]);
  }

  offset = writeChars(view, offset, 'rate');
  offset = writeDWORD(view, offset, ani.entries.length * 4);
  ani.entries.forEach((e) => {
    offset = writeDWORD(view, offset, Math.round(e.rate * 60 / 1000));
  });

  offset = writeChars(view, offset, 'seq ');
  offset = writeDWORD(view, offset, ani.entries.length * 4);
  ani.entries.forEach((_, i) => {
    offset = writeDWORD(view, offset, i);
  });

  offset = writeChars(view, offset, 'LIST');
  const framSizeOffset = offset;
  offset = writeDWORD(view, offset, 0); // placeholder
  offset = writeChars(view, offset, 'fram');
  const framStart = offset;

  curFrames.forEach((cur) => {
    offset = writeChars(view, offset, 'icon');
    offset = writeDWORD(view, offset, cur.byteLength);
    new Uint8Array(buffer, offset, cur.byteLength).set(cur);
    offset += cur.byteLength;
    if (offset % 2) offset++; // padding
  });

  const framSize = offset - framStart;
  view.setUint32(framSizeOffset, framSize + 4, true); // include 'fram' ID

  return buffer;
}

