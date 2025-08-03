<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

export type Dropdown<T> = {
  name: string;
  value: T;
  active: boolean;
  disabled: boolean;
};

const open = defineModel<boolean>('open', { default: false });

const { label = '', options } = defineProps<{
  label?: string;
  options: Dropdown<unknown>[];
}>();

const emits = defineEmits<{
  toggle: [val: boolean];
  change: [val: unknown];
}>();

const dropdownRef = ref<HTMLElement | null>(null);
const buttonRef = ref<HTMLElement | null>(null);
const _inputID = ref<string>(crypto.randomUUID());

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (
    dropdownRef.value &&
    buttonRef.value &&
    !dropdownRef.value.contains(target) &&
    !buttonRef.value.contains(target)
  ) {
    open.value = false;
    emits('toggle', false);
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});

function unique(id: string): string {
  return id + _inputID.value;
}

</script>
<template>
  <div class="relative">
    <button
      :id="unique('dropdown-toggle')"
      ref="buttonRef"
      class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
      type="button"
      @click="
        () => {
          open = !open;
          emits('toggle', open);
        }
      "
    >
      {{ label }}
      <svg
        class="w-2.5 h-2.5 ms-3"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 10 6"
      >
        <path
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="m1 1 4 4 4-4"
        />
      </svg>
    </button>

    <!-- Dropdown menu -->
    <div
      ref="dropdownRef"
      :id="unique('dropdown-body')"
      :class="{ hidden: !open }"
      class="absolute bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-44 dark:bg-gray-700 z-50"
    >
      <ul
        class="py-2 text-sm text-gray-700 dark:text-gray-200"
        aria-labelledby="dropdownDefaultButton"
      >
        <li
          v-for="(option, index) in options"
          :key="index"
        >
          <a
            @click="
              () => {
                open = false;
                emits('change', option.value);
              }
            "
            class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
          >
            {{ option.name }}
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>
