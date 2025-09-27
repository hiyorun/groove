<script setup lang="ts">
  import { onMounted, onBeforeUnmount, ref, watch, nextTick } from 'vue';
  import type { CursorHotspot, Frame } from '@/lib/groove';

  const props = defineProps<{
    cursorHotspot: CursorHotspot | undefined;
    frame: Frame | null;
    frameNumber: number;
    hotspotHint: boolean;
    dark: boolean;
    selectedSize: number;
  }>();

  const canvasRef = ref<HTMLCanvasElement | null>(null);
  const containerRef = ref<HTMLDivElement | null>(null);

  let animationFrameId: number;

  function drawBreathingCrosshair(ctx: CanvasRenderingContext2D, time: number) {
    const canvas = canvasRef.value;
    if (!canvas) return;

    const xhot = props.cursorHotspot?.x ?? 0;
    const yhot = props.cursorHotspot?.y ?? 0;

    const rect = canvas.getBoundingClientRect();
    const cssWidth = rect.width;
    const cssHeight = rect.height;

    const screenX = xhot * cssWidth;
    const screenY = yhot * cssHeight;

    const pixelRatioX = canvas.width / cssWidth;
    const pixelRatioY = canvas.height / cssHeight;
    const drawX = screenX * pixelRatioX;
    const drawY = screenY * pixelRatioY;

    const opacity = (Math.sin(time / 100) + 1) / 2;

    const minDim = Math.min(canvas.width, canvas.height);
    const crosshairSize = Math.max(100, Math.min(20, minDim * 0.1));
    const lineWidth = Math.max(5, minDim * 0.01);

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
    if (canvas && props.selectedSize) {
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

  let observer: ResizeObserver | null = null;

  onMounted(() => {
    nextTick(() => {
      resizeCanvas();
      animationFrameId = requestAnimationFrame(animate);

      if (containerRef.value) {
        observer = new ResizeObserver(() => {
          resizeCanvas();
        });
        observer.observe(containerRef.value);
      }
    });
  });

  onBeforeUnmount(() => {
    observer?.disconnect();
    cancelAnimationFrame(animationFrameId);
  });

  watch(
    () => [props.cursorHotspot],
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
    class="max-h-full w-full max-w-1/2 md:max-w-72 p-3 flex justify-center items-center"
    :class="{
      'bg-white text-gray-900': !dark,
      'bg-gray-900 text-white': dark,
    }"
  >
    <div class="relative w-full">
      <img
        v-if="frame"
        :src="frame.url"
        class="w-full pixel"
      />
      <canvas
        ref="canvasRef"
        :class="{ hidden: !hotspotHint }"
        class="absolute inset-0 w-full pointer-events-none object-contain pixel"
      />
    </div>
  </div>
</template>

<style scoped></style>
