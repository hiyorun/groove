<script setup lang="ts">
  import { computed } from 'vue';

  type Variant = 'primary' | 'success' | 'error' | 'warning' | 'info' | 'ghost';
  type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

  const {
    label = '',
    outlined = false,
    disabled = false,
    variant = 'primary',
    size = 'md',
  } = defineProps<{
    label?: string;
    outlined?: boolean;
    disabled?: boolean;
    variant?: Variant;
    size?: Size;
  }>();

  const emits = defineEmits<{
    click: [value: MouseEvent];
  }>();

  function click(evt: MouseEvent) {
    if (!disabled) emits('click', evt);
  }

  const colors: Record<Variant, { filled: string; outlined: string; ring: string }> = {
    primary: {
      filled:
        'bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-black dark:hover:bg-gray-200',
      outlined:
        'bg-white text-gray-900 border border-gray-300 hover:bg-gray-100 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700',
      ring: 'focus:ring-gray-400 dark:focus:ring-gray-500',
    },
    success: {
      filled:
        'bg-green-600 text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600',
      outlined:
        'bg-white text-green-700 border border-green-300 hover:bg-green-50 dark:bg-gray-800 dark:text-green-400 dark:border-green-600 dark:hover:bg-gray-700',
      ring: 'focus:ring-green-400 dark:focus:ring-green-600',
    },
    error: {
      filled: 'bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600',
      outlined:
        'bg-white text-red-700 border border-red-300 hover:bg-red-50 dark:bg-gray-800 dark:text-red-400 dark:border-red-600 dark:hover:bg-gray-700',
      ring: 'focus:ring-red-400 dark:focus:ring-red-600',
    },
    warning: {
      filled:
        'bg-yellow-500 text-black hover:bg-yellow-600 dark:bg-yellow-400 dark:hover:bg-yellow-500',
      outlined:
        'bg-white text-yellow-700 border border-yellow-300 hover:bg-yellow-50 dark:bg-gray-800 dark:text-yellow-400 dark:border-yellow-600 dark:hover:bg-gray-700',
      ring: 'focus:ring-yellow-400 dark:focus:ring-yellow-500',
    },
    info: {
      filled: 'bg-cyan-600 text-white hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600',
      outlined:
        'bg-white text-cyan-700 border border-cyan-300 hover:bg-cyan-50 dark:bg-gray-800 dark:text-cyan-400 dark:border-cyan-600 dark:hover:bg-gray-700',
      ring: 'focus:ring-cyan-400 dark:focus:ring-cyan-600',
    },
    ghost: {
      filled:
        'bg-transparent text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700',
      outlined:
        'bg-transparent text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700',
      ring: 'focus:ring-gray-300 dark:focus:ring-gray-600',
    },
  };

  const variantClasses = computed(() => {
    if (disabled) {
      return 'cursor-not-allowed bg-gray-400 text-gray-200 dark:bg-gray-500 dark:text-gray-300';
    }
    const variation = colors[variant] ?? colors.primary;
    return outlined ? variation.outlined : variation.filled;
  });

  const ringClasses = computed(() => {
    if (disabled) return '';
    return colors[variant]?.ring ?? colors.primary.ring;
  });

  const sizeClasses = computed(() => {
    const sizes: Record<Size, string> = {
      xs: 'px-2 py-1 text-xs',
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-5 py-2.5 text-base',
      xl: 'px-6 py-3 text-lg',
    };
    return sizes[size] ?? sizes.md;
  });
</script>

<template>
  <button
    @click="click"
    :disabled="disabled"
    class="inline-flex items-center justify-center gap-2 rounded-md font-medium focus:outline-none
      focus:ring-2 focus:ring-offset-1 transition-colors duration-200 material-symbols-state"
    :class="[variantClasses, sizeClasses, ringClasses, { 'cursor-pointer': !disabled }]"
  >
    <slot>{{ label }}</slot>
  </button>
</template>

<style scoped>
  .material-symbols-state:hover {
    font-variation-settings: 'FILL' 1;
  }
</style>
