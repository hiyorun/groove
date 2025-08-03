<script setup lang="ts">
export type Tab = {
  name: string;
  value: unknown;
  active: boolean;
  disabled: boolean;
};
const props = defineProps<{
  tabs: Tab[];
}>();

const emits = defineEmits<{
  change: [val: unknown];
}>();
</script>
<template>
  <div>
    <ul class="flex flex-wrap text-sm font-medium text-center text-gray-500 dark:text-gray-400">
      <li
        :key="tab.name"
        v-for="tab in props.tabs"
        class="me-2"
        @click="emits('change', tab.value)"
      >
        <a
          href="#"
          class="inline-block px-4 py-3 rounded-lg"
          :class="{
            'text-white bg-blue-600 active': tab.active,
            'hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-white':
              !tab.active,
            'text-gray-400 dark:text-gray-500 cursor-not-allowed': tab.disabled,
          }"
          aria-current="page"
          >{{ tab.name }}</a
        >
      </li>
    </ul>
  </div>
</template>
