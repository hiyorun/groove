<script setup lang="ts">
  import DropdownComponent from '../common/DropdownComponent.vue';
  import InputButton from '../input/InputButton.vue';

  defineProps<{
    frameLength: number;
  }>();

  const emits = defineEmits<{
    (e: 'export', value: string): void;
    (e: 'close'): void;
  }>();

  function onAction(val: unknown) {
    if (typeof val !== 'string') {
      console.error('export type is not string:', typeof val, val);
    }
    const exportType = `${val}`;
    emits('export', exportType);
  }
</script>
<template>
  <div class="p-3 flex justify-end items-center gap-2">
    <InputButton
      @click="emits('close')"
      label="Close"
      outlined
    />
    <DropdownComponent
      @change="onAction"
      :options="[
        {
          name: 'XCursor',
          value: 'xcursor',
        },
        {
          name: 'Hyprcursor',
          value: 'hyprcursor',
        },
        {
          name: 'Windows Cursor Format',
          value: 'mscursor',
          disabled: frameLength > 1,
        },
        {
          name: 'Windows Animated Cursor Format',
          value: 'msani',
        },
      ]"
    >
      <template #dropdown-toggle>
        <InputButton label="Export" />
      </template>
    </DropdownComponent>
  </div>
</template>
