<script setup lang="ts">
  import { useUniqueID } from '@/composables/useUniqueID';

  export type SelectOption<T> = {
    name: string;
    value: T;
    active: boolean;
    disabled: boolean;
  };

  const props = defineProps<{
    label?: string;
    multiple?: boolean;
    options: SelectOption<unknown>[];
    modelValue: unknown;
    id?: string;
  }>();

  const emits = defineEmits<{
    (e: 'update:modelValue', value: unknown): void;
    (e: 'focus', value: boolean): void;
    (e: 'change', value: Event): void;
  }>();

  const inputID = useUniqueID('select', props.id);

  function handleChange(event: Event) {
    const target = event.target as HTMLSelectElement;

    let emittedValue: unknown;
    if (props.multiple) {
      emittedValue = Array.from(target.options)
        .filter((option) => option.selected)
        .map((option) => option.value);
    } else {
      emittedValue = target.value;
    }

    emits('update:modelValue', emittedValue);
    emits('change', event);
  }
</script>

<template>
  <div class="w-full">
    <label
      v-if="props.label"
      :for="inputID"
      class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
    >
      {{ props.label }}
    </label>

    <select
      :id="inputID"
      :multiple="props.multiple"
      :value="props.modelValue"
      @change="handleChange"
      @focusin="emits('focus', true)"
      @focusout="emits('focus', false)"
      class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500
        focus:border-blue-500 block w-full px-2 py-1 dark:bg-gray-700 dark:border-gray-600
        dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500
        dark:focus:border-blue-500"
    >
      <option
        v-for="(option, index) in props.options"
        :key="index"
        :value="option.value"
        :selected="option.active"
        :disabled="option.disabled"
      >
        {{ option.name }}
      </option>
    </select>
  </div>
</template>
