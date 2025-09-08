<script setup lang="ts">
  import { ref } from 'vue';

  const {
    label = '',
    helper = '',
    placeholder = '',
    required = false,
  } = defineProps<{
    label?: string;
    helper?: string;
    placeholder?: string;
    required?: boolean;
  }>();

  const value = defineModel<number>({ default: 0 });

  const _inputID = ref<string>(crypto.randomUUID());
  let focusTimer: number = 0;

  const emits = defineEmits<{
    focus: [val: boolean];
  }>();

  function unique(id: string): string {
    return id + _inputID.value;
  }

  function buttonModifier(op: 'add' | 'sub') {
    clearTimeout(focusTimer);
    if (op === 'add') {
      value.value++;
    } else {
      value.value--;
    }
    emits('focus', true);
    focusTimer = setTimeout(() => {
      emits('focus', false);
    }, 3000);
  }
</script>
<template>
  <div class="w-full">
    <label
      v-if="label !== ''"
      :for="unique('number-input')"
      class="mb-1 block text-sm font-medium text-gray-900 dark:text-white"
      >{{ label }}</label
    >
    <div
      class="relative flex w-full items-center overflow-hidden bg-gray-50 border border-gray-300
        text-gray-900 text-sm rounded-md [&:has(input:focus)]:ring-blue-500
        [&:has(input:focus)]:border-blue-500 dark:bg-gray-700 dark:border-gray-600
        dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500
        dark:focus:border-blue-500"
    >
      <input
        @focusin="emits('focus', true)"
        @focusout="emits('focus', false)"
        :id="unique('number-input')"
        type="text"
        aria-describedby="helper-text-explanation"
        class="w-full border-0 px-2 py-1 text-sm"
        :placeholder="placeholder"
        :required="required"
        v-model.number="value"
      />
      <button
        @click="buttonModifier('sub')"
        :id="unique('decrement-button')"
        type="button"
        class="cursor-pointer self-stretch bg-gray-100 p-2 hover:bg-gray-200 dark:bg-gray-600
          dark:hover:bg-gray-800"
      >
        <svg
          class="h-3 w-3 text-gray-900 dark:text-white"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 18 2"
        >
          <path
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M1 1h16"
          />
        </svg>
      </button>

      <button
        @click="buttonModifier('add')"
        :id="unique('increment-button')"
        type="button"
        class="cursor-pointer self-stretch bg-gray-100 p-2 hover:bg-gray-200 dark:bg-gray-600
          dark:hover:bg-gray-800"
      >
        <svg
          class="h-3 w-3 text-gray-900 dark:text-white"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 18 18"
        >
          <path
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 1v16M1 9h16"
          />
        </svg>
      </button>
    </div>
  </div>
  <p
    v-if="helper !== ''"
    id="unique('helper-text-explanation')"
    class="mt-2 text-sm text-gray-500 dark:text-gray-400"
  >
    {{ helper }}
  </p>
</template>
