<script setup lang="ts">
  import { ref, computed } from 'vue';

  const {
    min = 0,
    max = 5,
    step = null,
  } = defineProps<{
    modelValue: number;
    min?: number;
    max?: number;
    step?: number | null;
    showTicks?: boolean;
  }>();

  const emit = defineEmits<{
    (e: 'update:modelValue', value: number): void;
  }>();

  const slider = ref<HTMLInputElement | null>(null);

  const marks = computed(() => {
    if (!step) return [];
    const count = Math.floor((max - min) / step);
    return Array.from({ length: count + 1 }, (_, i) => min + i * step);
  });

  const onInput = (e: Event) => {
    emit('update:modelValue', Number((e.target as HTMLInputElement).value));
  };
</script>

<template>
  <div class="flex flex-col w-full gap-1">
    <div
      v-if="showTicks"
      class="flex justify-between mx-2"
    >
      <span
        v-for="mark in marks"
        :key="mark"
        class="w-[2px] grow-0 h-2 bg-gray-300 dark:bg-gray-600"
      ></span>
    </div>
    <input
      ref="slider"
      type="range"
      :min="min"
      :max="max"
      :step="step ?? 'any'"
      :value="modelValue"
      @input="onInput"
      class="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-200 dark:bg-gray-700'"
    />
  </div>
</template>
