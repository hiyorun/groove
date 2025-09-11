import type { FrameObject, HyprCursor, ResizeAlgorithm } from './types';

export function parseMetaHl(content: string): HyprCursor {
  const data: HyprCursor = {
    resize_algorithm: 'none',
    hotspot_x: 0,
    hotspot_y: 0,
    nominal_size: 0,
    define_override: [],
    define_size: [],
  };

  const setNumericField = <K extends 'hotspot_x' | 'hotspot_y' | 'nominal_size'>(
    key: K,
    value: string,
  ) => {
    const num = parseFloat(value);
    if (!isNaN(num)) {
      data[key] = num;
    }
  };

  for (const line of content.split('\n')) {
    const m = line.match(/^\s*([^#\s]+)\s*=\s*(.+?)\s*$/);
    if (!m) continue;

    const key = m[1] as keyof HyprCursor | 'define_size' | 'define_override';
    const value = m[2].trim();

    switch (key) {
      case 'resize_algorithm':
        if (['bilinear', 'nearest', 'none'].includes(value)) {
          data.resize_algorithm = value as ResizeAlgorithm;
        }
        break;

      case 'hotspot_x':
      case 'hotspot_y':
      case 'nominal_size':
        setNumericField(key, value);
        break;

      case 'define_override':
        data.define_override.push(value);
        break;

      case 'define_size': {
        const [sizeStr, filename, delayStr] = value.split(',').map((s) => s.trim());
        const size: number = Number(sizeStr);
        let delay: number = Number(delayStr);
        if (isNaN(delay)) delay = 0;
        if (!isNaN(size)) {
          const file: FrameObject = {
            name: filename,
            url: '',
          };
          data.define_size.push({ size, file, delay });
        }
        break;
      }
    }
  }

  return data;
}

export function serializeMetaHl(data: HyprCursor): string {
  const lines: string[] = [];

  if (data.resize_algorithm) lines.push(`resize_algorithm = ${data.resize_algorithm}`);
  if (data.hotspot_x !== undefined) lines.push(`hotspot_x = ${data.hotspot_x}`);
  if (data.hotspot_y !== undefined) lines.push(`hotspot_y = ${data.hotspot_y}`);
  if (data.nominal_size !== undefined) lines.push(`nominal_size = ${data.nominal_size}`);

  for (const ov of data.define_override) {
    lines.push(`define_override = ${ov}`);
  }

  for (const frame of data.define_size) {
    lines.push(`define_size = ${frame.size}, ${frame.file}, ${frame.delay}`);
  }

  return lines.join('\n');
}
