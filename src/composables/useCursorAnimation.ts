import { onBeforeUnmount } from 'vue';
import { useCursorStore } from '@/stores/cursorStore';

export function useCursorController() {
  const store = useCursorStore();
  let timer: number;

  function clearFrameCounter() {
    clearTimeout(timer);
  }

  function startFrameCounter() {
    const cursor = store.cursor;
    const definition = cursor?.sizes.get(store.selectedSize);

    if (!definition) return;

    const frames = definition.frames;
    if (frames.length <= 1) {
      store.frame = 0;
      return;
    }

    const delay = Math.max(1, frames[store.frame].delay || 0);
    timer = setTimeout(() => {
      if (!store.cursor) return;
      store.frame = (store.frame + 1) % frames.length;
      startFrameCounter(); // recursive loop
    }, delay);
  }

  function disposeCursorData() {
    const cleanup = (cur: typeof store.cursor) => {
      if (!cur) return;
      cur.sizes.forEach((definition) =>
        definition.frames.forEach((frame) => URL.revokeObjectURL(frame.url)),
      );
    };

    cleanup(store.cursor);
    cleanup(store.resetState);
    store.cursor = undefined;
    store.resetState = undefined;
  }

  function dispose() {
    clearFrameCounter();
    disposeCursorData();
  }

  onBeforeUnmount(() => {
    dispose();
  });

  return {
    startFrameCounter,
    clearFrameCounter,
    dispose,
  };
}
