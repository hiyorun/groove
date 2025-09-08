<script setup lang="ts">
  const {
    label = '',
    filled = false,
    disabled = false,
  } = defineProps<{
    label?: string;
    filled?: boolean;
    disabled?: boolean;
  }>();

  const emits = defineEmits<{
    click: [value: MouseEvent];
  }>();

  function click(evt: MouseEvent) {
    emits('click', evt);
  }
</script>
<template>
  <button
    @click="click"
    :disabled="disabled"
    class="rounded-md px-4 py-2 text-sm font-medium focus:outline-none focus:ring-1
      focus:ring-blue-300 dark:focus:ring-blue-800"
    :class="{
      'bg-blue-700 text-white hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700':
        filled && !disabled,
      [`border border-gray-300 bg-white text-gray-900 hover:bg-gray-100 dark:border-gray-600
      dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700`]: !filled && !disabled,
      'cursor-not-allowed bg-gray-400 text-gray-200 dark:bg-gray-500 dark:text-gray-300': disabled,
      'cursor-pointer ': !disabled,
    }"
  >
    <slot>{{ label }}</slot>
  </button>
</template>
