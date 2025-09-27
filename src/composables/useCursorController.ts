import { useCursorStore } from '@/stores/cursorStore';
import { useEditorStore } from '@/stores/editorStore';

export function useCursorController() {
  const cursorStore = useCursorStore();
  const editorStore = useEditorStore();

  let timer: ReturnType<typeof setTimeout> | null = null;

  function clearFrameCounter() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  }

  function tick() {
    if (editorStore.paused) return;

    const frames = cursorStore.getFrames(editorStore.selectedSize);

    if (frames.length <= 1) {
      editorStore.frame = 0;
      return;
    }

    const frame = frames[editorStore.frame] ?? frames[0];
    const delay = Math.max(1, frame.delay || 0);

    timer = setTimeout(() => {
      if (editorStore.paused) {
        timer = null;
        return;
      }
      editorStore.nextFrame(frames.length);
      tick();
    }, delay);
  }

  function pauseFrameCounter() {
    editorStore.paused = true;
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  }

  function resumeFrameCounter() {
    if (editorStore.paused) {
      editorStore.paused = false;
      tick();
    }
  }

  function startFrameCounter() {
    clearFrameCounter();
    editorStore.paused = false;
    tick();
  }

  function dispose() {
    clearFrameCounter();
    cursorStore.clear();
    editorStore.reset();
  }

  return {
    startFrameCounter,
    pauseFrameCounter,
    resumeFrameCounter,
    clearFrameCounter,
    dispose,
  };
}
