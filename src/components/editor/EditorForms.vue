<script setup lang="ts">
  import type { CursorHotspot, Frame } from '@/lib/groove';
  import InputNumber from '@/components/input/InputNumber.vue';

  defineProps<{
    cursorHotspot: CursorHotspot | undefined;
    frames: Frame[];
    currentFrame: number;
  }>();

  const emit = defineEmits<{
    (e: 'update:cursorHotspot', value: CursorHotspot | undefined): void;
    (e: 'update:hotspotHint', value: boolean): void;
  }>();
</script>
<template>
  <div class="flex flex-col relative">
    <div
      class="sticky z-10 top-0 left-0 shadow-md bg-gray-50 dark:bg-gray-700 p-3 grid grid-cols-1
        sm:grid-cols-2 gap-3"
    >
      <InputNumber
        :label="'X Hotspot'"
        :model-value="Math.round(cursorHotspot ? cursorHotspot.x * 100 : 0)"
        @update:model-value="
          ($event: number) => {
            if (!cursorHotspot) return;
            emit('update:cursorHotspot', {
              x: $event / 100,
              y: cursorHotspot.y,
            });
          }
        "
        @focus="emit('update:hotspotHint', $event)"
      />
      <InputNumber
        :label="'Y Hotspot'"
        :model-value="Math.round(cursorHotspot ? cursorHotspot.y * 100 : 0)"
        @update:model-value="
          ($event: number) => {
            if (!cursorHotspot) return;
            emit('update:cursorHotspot', {
              y: $event / 100,
              x: cursorHotspot.x,
            });
          }
        "
        @focus="emit('update:hotspotHint', $event)"
      />
    </div>
    <div
      class="p-3 grid grid-cols-3 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7 2xl:grid-cols-8
        gap-2"
    >
      <div
        :key="index"
        v-for="(frame, index) in frames"
        :class="currentFrame === index ? 'border-blue-500' : 'border-transparent'"
        class="relative flex flex-col gap-2 items-center rounded-lg p-1 border-1 shadow-lg
          bg-gray-50 dark:bg-gray-700 hover:bg-gray-300 hover:dark:bg-gray-500"
      >
        <div class="flex justify-between self-stretch pl-2">
          <span class="text-gray-900 dark:text-gray-50 w-8">{{ index }}</span>
          <!-- <DropdownComponent -->
          <!--   :options="[ -->
          <!--     { -->
          <!--       name: 'Add Before', -->
          <!--       value: '', -->
          <!--     }, -->
          <!--   ]" -->
          <!-- > -->
          <!-- </DropdownComponent> -->
        </div>
        <img
          :src="frame.url"
          class="h-10 object-contain pixel"
        />
        <InputNumber
          :label="'Delay'"
          v-model="frame.delay"
        />
      </div>
    </div>
  </div>
</template>
<style scoped></style>
