import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useEditorStore = defineStore('editor', () => {
  const ready = ref<boolean>(false);

  const selectedSize = ref<number>(0);
  const frame = ref<number>(0);
  const hotspotHint = ref<boolean>(false);
  const dark = ref<boolean>(false);

  function nextFrame(frameCount: number) {
    if (frameCount <= 1) {
      frame.value = 0;
      return;
    }
    frame.value = (frame.value + 1) % frameCount;
  }

  function reset() {
    frame.value = 0;
    selectedSize.value = 0;
    hotspotHint.value = false;
    ready.value = false
  }

  return {
    ready,
    selectedSize,
    frame,
    hotspotHint,
    nextFrame,
    reset,
    dark,
  };
});
