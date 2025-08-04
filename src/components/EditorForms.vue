<script setup lang="ts">
import type { Definition } from '@/lib/groove';
import InputNumber from './input/InputNumber.vue';
import { useCursorStore } from '@/stores/cursorStore';
import { computed } from 'vue';

const store = useCursorStore();

const properties = computed<Definition | undefined>({
  get: () => store.currentDefinition,
  set: (val: Definition | undefined) => {
    store.currentDefinition = val;
  },
});
</script>
<template>
  <div class="flex flex-col relative">
    <div class="sticky z-10 top-0 left-0 shadow-md bg-gray-50 dark:bg-gray-700 p-3 grid grid-cols-1
      sm:grid-cols-2 gap-3">
      <InputNumber
        :label="'X Hotspot'"
        :model-value="properties?.xhot"
        @update:model-value="
          ($event: number) => {
            if (!properties) return;
            properties = {
              ...properties,
              xhot: $event,
            };
          }
        "
        @focus="store.hotspotHint = $event"
      />
      <InputNumber
        :label="'Y Hotspot'"
        :model-value="properties?.yhot"
        @update:model-value="
          ($event: number) => {
            if (!properties) return;
            properties = {
              ...properties,
              yhot: $event,
            };
          }
        "
        @focus="store.hotspotHint = $event"
      />
    </div>
    <div class="p-3 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-9">
      <div
        :key="index"
        v-for="(frame, index) in store.currentFrames"
        :class="store.frame === index ? 'border-lime-400' : 'border-transparent'"
        class="relative flex flex-col gap-2 items-center rounded-md p-1 border-1 hover:bg-gray-800"
      >
        <span class="text-gray-900 dark:text-gray-50 w-8">#{{ index }}</span>
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
<style scoped>
</style>
