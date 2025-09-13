import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { Cursor, CursorHandler, Frame, Definition, CursorHotspot } from '@/lib/groove';
import { parseCursorFile, makeCursorFile, identCursorFile } from '@/handlers/cursor';

export const useCursorStore = defineStore('cursor', () => {
  const cursor = ref<Cursor | undefined>();
  const resetState = ref<Cursor | undefined>();

  const ready = computed(() => !!cursor.value);
  const sizes = computed(() => (cursor.value ? [...cursor.value.sizes.keys()] : []));
  const name = computed(() => cursor.value?.name ?? '');

  const getCursorHotspot = computed(() => {
    return cursor.value?.hotspot;
  });

  const getDefinition = computed(() => {
    return (size: number): Definition | undefined => {
      return cursor.value?.sizes.get(size);
    };
  });

  const getFrames = computed(() => {
    return (size: number): Frame[] => {
      return getDefinition.value(size)?.frames ?? [];
    };
  });

  function _setCursor(newCursor: Cursor) {
    cursor.value = newCursor;

    // Clone sizes map (deep enough to avoid reactive weirdness)
    const clonedSizes = new Map<number, Definition>();
    for (const [size, def] of newCursor.sizes.entries()) {
      clonedSizes.set(size, {
        frames: [...def.frames], // shallow clone of frames
      });
    }

    resetState.value = {
      name: newCursor.name,
      version: newCursor.version,
      hotspot: newCursor.hotspot,
      sizes: clonedSizes,
    };
  }

  function clear() {
    const cleanup = (cur: Cursor | undefined) => {
      if (!cur) return;
      cur.sizes.forEach((definition) =>
        definition.frames.forEach((frame) => URL.revokeObjectURL(frame.url)),
      );
    };

    cleanup(cursor.value);
    cleanup(resetState.value);
    cursor.value = undefined;
    resetState.value = undefined;
  }

  function updateDefinition(size: number, definition: Definition) {
    if (!cursor.value) return;
    cursor.value.sizes.set(size, definition);
  }

  function updateHotspot(newHotspot: CursorHotspot) {
    if (!cursor.value) return;
    cursor.value.hotspot = newHotspot;
  }

  async function parse(handler: CursorHandler, file: File): Promise<number> {
    const parsed = await parseCursorFile(handler, file);
    console.log(parsed);
    _setCursor(parsed);
    const initialSize = sizes.value.length > 0 ? Math.min(...sizes.value) : 0;
    return initialSize;
  }

  async function make(handler: CursorHandler) {
    if (!cursor.value) return;
    await makeCursorFile(handler, cursor.value);
  }

  async function ident(handler: CursorHandler, file: File): Promise<boolean> {
    return await identCursorFile(handler, file);
  }

  function reset() {
    if (resetState.value) {
      const newSizes = new Map(resetState.value.sizes);
      _setCursor({ ...resetState.value, sizes: newSizes });
    }
  }

  return {
    ready,
    sizes,
    name,
    getCursorHotspot,
    getDefinition,
    getFrames,
    clear,
    updateDefinition,
    updateHotspot,
    parse,
    make,
    ident,
    reset,
  };
});
