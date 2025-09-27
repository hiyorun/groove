<script setup lang="ts">
  import { useUniqueID } from '@/composables/useUniqueID';
  import { computed } from 'vue';

  const props = defineProps<{
    label?: string;
    modelValue: boolean | undefined;
    disabled?: boolean;
  }>();

  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void;
  }>();

  const uniqueID = useUniqueID('checkbox');

  const isChecked = computed({
    get: () => props.modelValue,
    set: (value) => {
      emit('update:modelValue', value);
    },
  });
</script>
<template>
  <div class="flex items-center">
    <input
      :id="uniqueID"
      v-model="isChecked"
      :disabled="disabled"
      type="checkbox"
      class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500
        dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700
        dark:border-gray-600"
    />
    <label
      :for="uniqueID"
      class="ms-2 text-sm font-medium"
      :class="{
        'text-gray-400 dark:text-gray-500': disabled,
        'text-gray-900 dark:text-gray-300': !disabled,
      }"
    >
      {{ label }}
    </label>
  </div>
</template>
