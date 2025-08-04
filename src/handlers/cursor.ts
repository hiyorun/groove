import type { Cursor, CursorHandler } from '@/lib/groove';

export async function parseCursorFile(handler: CursorHandler, file: File): Promise<Cursor> {
  try {
    return await handler.parse(file);
  } catch (err) {
    throw new Error(`There's a problem during parsing: ${err}`);
  }
}

export async function makeCursorFile(handler: CursorHandler, cursor: Cursor): Promise<void> {
  const builtCursor = await handler.make(cursor);
  const url = URL.createObjectURL(builtCursor);

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = cursor.name;
  anchor.click();

  URL.revokeObjectURL(url);
}

export async function identCursorFile(handler: CursorHandler, file: File): Promise<boolean> {
  return handler.ident(file);
}
