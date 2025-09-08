<script setup lang="ts">
  import { ref } from 'vue';

  export type SelectOption<T> = {
    name: string;
    value: T;
    active: boolean;
    disabled: boolean;
  };

  const _inputID = ref<string>(crypto.randomUUID());

  const {
    label = '',
    multiple = false,
    options,
  } = defineProps<{
    label?: string;
    multiple?: boolean;
    options: SelectOption<unknown>[];
  }>();

  const emits = defineEmits<{
    focus: [val: boolean];
    change: [val: Event];
  }>();

  function handleChange(event: Event) {
    emits('change', event);
  }

  function unique(id: string): string {
    return id + _inputID.value;
  }
</script>

<template>
  <label
    v-if="label !== ''"
    :for="unique('select')"
    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
  >
    {{ label }}
  </label>
  <select
    :id="unique('select')"
    :multiple="multiple"
    @change="handleChange"
    @focusin="emits('focus', true)"
    @focusout="emits('focus', false)"
    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500
      focus:border-blue-500 block w-full px-2 py-1 dark:bg-gray-700 dark:border-gray-600
      dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
  >
    <option
      v-for="(option, index) in options"
      :key="index"
      :value="option.value"
      :selected="option.active"
      :disabled="option.disabled"
    >
      {{ option.name }}
    </option>
  </select>
</template>
