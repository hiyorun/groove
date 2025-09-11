import { watch } from 'vue';
import { useCursorStore } from '@/stores/cursorStore';
import { useEditorStore } from '@/stores/editorStore';

export function useCursorController() {
  const cursorStore = useCursorStore();
  const editorStore = useEditorStore();
  let timer: number;

  function clearFrameCounter() {
    clearTimeout(timer);
  }

  function startFrameCounter() {
    clearFrameCounter();

    const frames = cursorStore.getFrames(editorStore.selectedSize);
    if (frames.length <= 1) {
      editorStore.frame = 0;
      return;
    }

    const frame = frames[editorStore.frame];
    if (!frame) {
      editorStore.frame = 0;
      return;
    }

    const delay = Math.max(1, frame.delay || 0);
    timer = setTimeout(() => {
      editorStore.nextFrame(frames.length);
      startFrameCounter();
    }, delay);
  }

  function dispose() {
    clearFrameCounter();
    cursorStore.clear();
    editorStore.reset();
  }

  // Restart the animation when the selected size changes
  watch(() => editorStore.selectedSize, startFrameCounter);

  return {
    startFrameCounter,
    clearFrameCounter,
    dispose,
  };
}
