<script setup lang="ts">
import type { Definition, Frame } from '@/lib/groove';
import InputNumber from './input/InputNumber.vue';

defineProps<{
  definition: Definition | undefined;
  frames: Frame[];
  currentFrame: number;
}>();

const emit = defineEmits<{
  (e: 'update:definition', value: Definition | undefined): void;
  (e: 'update:hotspotHint', value: boolean): void;
}>();
</script>
<template>
  <div class="flex flex-col relative">
    <div class="sticky z-10 top-0 left-0 shadow-md bg-gray-50 dark:bg-gray-700 p-3 grid grid-cols-1
      sm:grid-cols-2 gap-3">
      <InputNumber
        :label="'X Hotspot'"
        :model-value="definition?.xhot"
        @update:model-value="
          ($event: number) => {
            if (!definition) return;
            emit('update:definition', { ...definition, xhot: $event });
          }
        "
        @focus="emit('update:hotspotHint', true)"
      />
      <InputNumber
        :label="'Y Hotspot'"
        :model-value="definition?.yhot"
        @update:model-value="
          ($event: number) => {
            if (!definition) return;
            emit('update:definition', { ...definition, yhot: $event });
          }
        "
        @focus="emit('update:hotspotHint', true)"
      />
    </div>
    <div class="p-3 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-9">
      <div
        :key="index"
        v-for="(frame, index) in frames"
        :class="currentFrame === index ? 'border-lime-400' : 'border-transparent'"
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