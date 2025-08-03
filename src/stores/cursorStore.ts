import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { Cursor, CursorHandler, Frame, Definition } from '@/lib/groove';

export const useCursorStore = defineStore('cursor', () => {
  const ready = ref<boolean>(false);
  const cursor = ref<Cursor | undefined>();
  const resetState = ref<Cursor | undefined>();
  const sizes = ref<number[]>([]);
  const selectedSize = ref<number>(0);
  const frame = ref<number>(0);
  const hotspotHint = ref<boolean>(false);
  const dark = ref<boolean>(false);

  const currentDefinition = computed<Definition | undefined>({
    get() {
      return cursor.value?.sizes.get(selectedSize.value);
    },
    set(newDef: Definition | undefined) {
      if (!cursor.value || newDef === undefined) return;
      cursor.value.sizes.set(selectedSize.value, newDef);
    },
  });

  const currentFrames = computed<Frame[]>({
    get() {
      return currentDefinition.value?.frames ?? [];
    },
    set(newFrames: Frame[]) {
      if (!currentDefinition.value) return;
      // Update frames on the current Definition
      currentDefinition.value.frames = newFrames;

      // Make sure to update the map as well to keep reactivity
      cursor.value?.sizes.set(selectedSize.value, currentDefinition.value);
    },
  });

  const currentFrame = computed(() => currentFrames.value?.[frame.value] ?? null);

  async function parse(handler: CursorHandler, file: File) {
    try {
      const parsed = await handler.parse(file);
      cursor.value = parsed;

      // Clone sizes map (deep enough to avoid reactive weirdness)
      const clonedSizes = new Map<number, Definition>();
      for (const [size, def] of parsed.sizes.entries()) {
        clonedSizes.set(size, {
          xhot: def.xhot,
          yhot: def.yhot,
          frames: [...def.frames], // shallow clone of frames
        });
      }

      resetState.value = {
        name: parsed.name,
        version: parsed.version,
        sizes: clonedSizes,
      };

      sizes.value = [...parsed.sizes.keys()];
      selectedSize.value = Math.min(...sizes.value);
    } catch (err) {
      throw new Error("There's a problem during parsing: " + err);
    }
  }

  async function make(handler: CursorHandler) {
    if (!cursor.value) return;

    const builtCursor = await handler.make(cursor.value);
    const url = URL.createObjectURL(builtCursor);

    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = cursor.value.name;
    anchor.click();

    URL.revokeObjectURL(url);
  }

  async function ident(handler: CursorHandler, file: File): Promise<boolean> {
    return handler.ident(file);
  }

  return {
    hotspotHint,
    ready,
    cursor,
    resetState,
    sizes,
    selectedSize,
    frame,
    currentFrame,
    currentFrames,
    currentDefinition,
    parse,
    make,
    ident,
    dark,
  };
});
