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
      class="block mb-1 text-sm font-medium text-gray-900 dark:text-white"
      >{{ label }}</label
    >
    <div class="relative flex items-center w-full border-1 border-gray-500 dark:border-gray-800 bg-gray-50 dark:bg-gray-700 rounded overflow-hidden">
      <input
        @focusin="emits('focus', true)"
        @focusout="emits('focus', false)"
        :id="unique('number-input')"
        type="text"
        aria-describedby="helper-text-explanation"
        class="border-0 py-1 px-2 w-full"
        :placeholder="placeholder"
        :required="required"
        v-model.number="value"
      />
      <button
        @click="buttonModifier('sub')"
        :id="unique('decrement-button')"
        type="button"
        class="bg-gray-100 dark:bg-gray-600 self-stretch p-2 cursor-pointer hover:bg-gray-200
        dark:hover:bg-gray-800"
      >
        <svg
          class="w-3 h-3 text-gray-900 dark:text-white"
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
        class="bg-gray-100 dark:bg-gray-600 self-stretch p-2 cursor-pointer hover:bg-gray-200
        dark:hover:bg-gray-800"
      >
        <svg
          class="w-3 h-3 text-gray-900 dark:text-white"
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
