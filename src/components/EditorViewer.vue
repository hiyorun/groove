<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch, nextTick } from 'vue';
import { useCursorStore } from '@/stores/cursorStore';

const store = useCursorStore();
const canvasRef = ref<HTMLCanvasElement | null>(null);
const containerRef = ref<HTMLDivElement | null>(null);

let animationFrameId: number;

function drawBreathingCrosshair(ctx: CanvasRenderingContext2D, time: number) {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const xhot = store.currentDefinition?.xhot ?? 0;
  const yhot = store.currentDefinition?.yhot ?? 0;
  const imageSize = store.selectedSize ?? 1;

  const rect = canvas.getBoundingClientRect();
  const cssWidth = rect.width;
  const cssHeight = rect.height;

  const normX = xhot / imageSize;
  const normY = yhot / imageSize;

  const screenX = normX * cssWidth;
  const screenY = normY * cssHeight;

  const pixelRatioX = canvas.width / cssWidth;
  const pixelRatioY = canvas.height / cssHeight;
  const drawX = screenX * pixelRatioX;
  const drawY = screenY * pixelRatioY;

  const opacity = (Math.sin(time / 100) + 1) / 2;

  const minDim = Math.min(canvas.width, canvas.height);
  const crosshairSize = Math.max(50, Math.min(20, minDim * 0.1));
  const lineWidth = Math.max(1, minDim * 0.01);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = `rgba(255, 0, 0, ${opacity})`;
  ctx.lineWidth = lineWidth;

  ctx.beginPath();
  ctx.moveTo(drawX - crosshairSize, drawY);
  ctx.lineTo(drawX + crosshairSize, drawY);
  ctx.moveTo(drawX, drawY - crosshairSize);
  ctx.lineTo(drawX, drawY + crosshairSize);
  ctx.stroke();
}

function animate(time: number) {
  const canvas = canvasRef.value;
  if (canvas && store.selectedSize) {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      drawBreathingCrosshair(ctx, time);
    }
  }
  animationFrameId = requestAnimationFrame(animate);
}

function resizeCanvas() {
  if (!canvasRef.value) return;

  const canvas = canvasRef.value;
  const baseSize = 1024;

  canvas.width = baseSize;
  canvas.height = baseSize;

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

    if (containerRef.value) {
      const observer = new ResizeObserver(() => {
        resizeCanvas();
      });
      observer.observe(containerRef.value);

      onBeforeUnmount(() => {
        observer.disconnect();
      });
    }
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
    class="w-full h-full p-3"
    :class="{ 'bg-white text-gray-900': !store.dark, 'bg-gray-900 text-white': store.dark }"
  >
    <div
      class="h-full w-full relative"
      ref="containerRef"
    >
      <img
        v-if="store.currentFrame"
        class="max-w-full max-h-full min-h-28 w-full md:w-auto md:h-full object-contain cursor-preview"
        :src="store.currentFrame.url"
      />
      <canvas
        ref="canvasRef"
        :class="{ hidden: !store.hotspotHint }"
        class="absolute top-0 left-0 w-full h-full pointer-events-none object-contain"
      />
    </div>
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
