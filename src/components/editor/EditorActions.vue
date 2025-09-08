<script setup lang="ts">
  import DropdownComponent from '../common/DropdownComponent.vue';
  import InputButton from '../input/InputButton.vue';

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
  <div class="p-3 flex justify-end gap-2">
    <InputButton
      @click="emits('close')"
      label="Close"
    />
    <DropdownComponent
      @change="onAction"
      :options="[
        {
          name: 'XCursor',
          value: 'xcursor',
        },
      ]"
    >
      <template #dropdown-toggle>
        <InputButton
          filled
          label="Export"
        />
      </template>
    </DropdownComponent>
  </div>
</template>
