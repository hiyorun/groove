<script setup lang="ts">
  import { computed } from 'vue';

  type Variant = 'plain' | 'info' | 'success' | 'warn' | 'danger';
  const { variant = 'plain' } = defineProps<{
    variant?: Variant;
  }>();

  const variantClass = computed(() => {
    switch (variant) {
      case 'plain':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'info':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'warn':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'danger':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return '';
    }
  });
</script>
<template>
  <span :class="variantClass" class="text-xs font-medium px-2.5 py-0.5 rounded-full">
    <slot></slot>
  </span>
</template>
