<script setup lang="ts">
  import { computed } from 'vue';
  type Variant = 'primary' | 'success' | 'error' | 'warning' | 'info' | 'ghost';

  const {
    label = '',
    outlined = false,
    disabled = false,
    variant = 'primary',
  } = defineProps<{
    label?: string;
    outlined?: boolean;
    disabled?: boolean;
    ghost?: boolean;
    variant?: Variant;
  }>();

  const emits = defineEmits<{
    click: [value: MouseEvent];
  }>();

  function click(evt: MouseEvent) {
    if (!disabled) emits('click', evt);
  }

  const variantClasses = computed(() => {
    if (disabled) {
      return 'cursor-not-allowed bg-gray-400 text-gray-200 dark:bg-gray-500 dark:text-gray-300';
    }

    const colors: Record<string, { filled: string; outlined: string }> = {
      primary: {
        filled:
          'bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-black dark:hover:bg-gray-200',
        outlined:
          'bg-white text-gray-900 border border-gray-300 hover:bg-gray-100 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700',
      },
      success: {
        filled:
          'bg-green-600 text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600',
        outlined:
          'bg-white text-green-700 border border-green-300 hover:bg-green-50 dark:bg-gray-800 dark:text-green-400 dark:border-green-600 dark:hover:bg-gray-700',
      },
      error: {
        filled: 'bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600',
        outlined:
          'bg-white text-red-700 border border-red-300 hover:bg-red-50 dark:bg-gray-800 dark:text-red-400 dark:border-red-600 dark:hover:bg-gray-700',
      },
      warning: {
        filled:
          'bg-yellow-500 text-black hover:bg-yellow-600 dark:bg-yellow-400 dark:hover:bg-yellow-500',
        outlined:
          'bg-white text-yellow-700 border border-yellow-300 hover:bg-yellow-50 dark:bg-gray-800 dark:text-yellow-400 dark:border-yellow-600 dark:hover:bg-gray-700',
      },
      info: {
        filled: 'bg-cyan-600 text-white hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600',
        outlined:
          'bg-white text-cyan-700 border border-cyan-300 hover:bg-cyan-50 dark:bg-gray-800 dark:text-cyan-400 dark:border-cyan-600 dark:hover:bg-gray-700',
      },
      ghost: {
        filled:
          'bg-transparent text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700',
        outlined:
          'bg-transparent text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700',
      },
    };

    const variation = colors[variant] ?? colors.primary;
    return outlined ? variation.outlined : variation.filled;
  });
</script>

<template>
  <button
    @click="click"
    :disabled="disabled"
    class="rounded-md px-4 py-2 text-sm font-medium focus:outline-none focus:ring-1
      focus:ring-offset-1 focus:ring-blue-300 dark:focus:ring-blue-800 transition-colors
      duration-200"
    :class="[variantClasses, { 'cursor-pointer': !disabled }]"
  >
    <slot>{{ label }}</slot>
  </button>
</template>

<style scoped>
  .button:hover {
    font-variant-settings: 'FILL' 1;
  }
</style>
