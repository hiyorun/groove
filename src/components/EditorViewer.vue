<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch, nextTick } from 'vue';
import { useCursorStore } from '@/stores/cursorStore';

const store = useCursorStore();
const canvasRef = ref<HTMLCanvasElement | null>(null);
const containerRef = ref<HTMLDivElement | null>(null);

let animationFrameId: number;

function drawBreathingDot(ctx: CanvasRenderingContext2D, time: number) {
  const xhot = store.currentDefinition?.xhot ?? 0;
  const yhot = store.currentDefinition?.yhot ?? 0;
  const width = store.selectedSize ?? 0;
  const height = width;

  const opacity = (Math.sin(time / 100) + 1) / 2;

  const minDim = Math.min(width, height);
  const radius = Math.max(2, Math.min(10, minDim * 0.05));

  ctx.clearRect(0, 0, width, height);
  ctx.beginPath();
  ctx.arc(xhot, yhot, radius, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(255, 0, 0, ${opacity})`;
  ctx.fill();
}

function animate(time: number) {
  const canvas = canvasRef.value;
  if (canvas && store.selectedSize) {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      drawBreathingDot(ctx, time);
    }
  }
  animationFrameId = requestAnimationFrame(animate);
}

function resizeCanvas() {
  if (!canvasRef.value || !store.selectedSize) return;

  const width = store.selectedSize;
  const height = width;
  const canvas = canvasRef.value;
  canvas.width = width;
  canvas.height = height;

  // Match image scaling (object-contain)
  const container = containerRef.value;
  if (container) {
    canvas.style.width = container.clientWidth + 'px';
    canvas.style.height = container.clientHeight + 'px';
  }
}

onMounted(() => {
  nextTick(() => {
    resizeCanvas();
    animationFrameId = requestAnimationFrame(animate);
  });
});

onBeforeUnmount(() => {
  cancelAnimationFrame(animationFrameId);
});

watch(
  () => [store.selectedSize, store.currentDefinition],
  () => {
    nextTick(() => {
      resizeCanvas();
    });
  },
  { deep: true },
);
</script>

<template>
  <div
    class="h-full w-full relative"
    :class="{ 'bg-white text-gray-900': !store.dark, 'bg-gray-900 text-white': store.dark }"
    ref="containerRef"
  >
    <img
      v-if="store.currentFrame"
      class="max-w-full max-h-full min-h-28 w-full md:w-auto md:h-full object-contain cursor-preview"
      :src="store.currentFrame.url"
    />
    <canvas
      v-if="store.hotspotHint"
      ref="canvasRef"
      class="absolute top-0 left-0 pointer-events-none object-contain"
    />
  </div>
</template>

<style scoped>
.cursor-preview {
  image-rendering: pixelated;
}
canvas {
  image-rendering: pixelated;
}
</style>
