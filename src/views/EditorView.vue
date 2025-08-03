<script setup lang="ts">
import EditorForms from '@/components/EditorForms.vue';
import EditorPreview from '@/components/EditorPreview.vue';
import EditorViewer from '@/components/EditorViewer.vue';
import InputDropdown, { type Dropdown } from '@/components/input/InputDropdown.vue';
import { useCursorStore } from '@/stores/cursorStore';
import { computed } from 'vue';

const store = useCursorStore();

const sizeTab = computed<Dropdown<number>[]>({
  get(): Dropdown<number>[] {
    return store.sizes.map((size) => {
      const opt: Dropdown<number> = {
        name: size.toString(),
        value: size,
        active: size === store.selectedSize,
        disabled: false,
      };
      return opt;
    });
  },
  set(val: Dropdown<number>[]) {
    console.log(val);
  },
});

function changeSizeGroup(evt: number) {
  store.selectedSize = evt;
}
</script>
<template>
  <div class="w-full h-full">
    <div class="flex flex-col md:flex-row gap-3 w-full h-full">
      <div class="flex flex-col">
        <div
          class="flex justify-between items-baseline p-3 mb-3 shadow-md rounded-md bg-gray-50 dark:bg-gray-700"
        >
          Size:
          <InputDropdown
            :options="sizeTab"
            :label="`${store.selectedSize}`"
            @change="changeSizeGroup($event as number)"
          />
        </div>
        <div class="grid grid-cols-2 md:grid-cols-1 gap-3 h-full justify-items-center">
          <EditorViewer class="shadow-md rounded-md p-3" />
          <EditorPreview class="shadow-md rounded-md" />
        </div>
      </div>
      <div class="overflow-scroll grow shadow-md rounded-md bg-gray-50 dark:bg-gray-700">
        <EditorForms />
      </div>
    </div>
  </div>
</template>
