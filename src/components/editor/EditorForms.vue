<script setup lang="ts">
  import type { CursorHotspot, Frame } from '@/lib/groove';
  import InputNumber from '@/components/input/InputNumber.vue';
  import InputTabs from '../input/InputTabs.vue';
  import { ref } from 'vue';
  import InputCheckbox from '../input/InputCheckbox.vue';

  const unifiedDelay = defineModel<boolean>('unifiedDelay');
  const unifiedDelayTime = defineModel<number>('unifiedDelayTime');

  defineProps<{
    cursorHotspot: CursorHotspot | undefined;
    frames: Frame[];
    currentFrame: number;
  }>();

  const emit = defineEmits<{
    (e: 'update:cursorHotspot', value: CursorHotspot | undefined): void;
    (e: 'update:hotspotHint', value: boolean): void;
  }>();

  const tabs = ['Frames', 'Metadata'];

  const currentTab = ref<string>('Frames');
</script>
<template>
  <div class="flex flex-col relative gap-2">
    <InputTabs
      :tabs="tabs"
      v-model="currentTab"
      class="mx-2 mt-2"
    />
    <div
      v-if="currentTab === 'Metadata'"
      class="bg-gray-50 dark:bg-gray-700 grid grid-cols-2 sm:grid-cols-4 gap-2 m-2 mt-0"
    >
      <InputNumber
        :label="'X Hotspot'"
        :model-value="Math.round(cursorHotspot ? cursorHotspot.x * 100 : 0)"
        @update:model-value="
          ($event: number) => {
            if (!cursorHotspot) return;
            emit('update:cursorHotspot', {
              x: $event / 100,
              y: cursorHotspot.y,
            });
          }
        "
        @focus="emit('update:hotspotHint', $event)"
      />
      <InputNumber
        :label="'Y Hotspot'"
        :model-value="Math.round(cursorHotspot ? cursorHotspot.y * 100 : 0)"
        @update:model-value="
          ($event: number) => {
            if (!cursorHotspot) return;
            emit('update:cursorHotspot', {
              y: $event / 100,
              x: cursorHotspot.x,
            });
          }
        "
        @focus="emit('update:hotspotHint', $event)"
      />
      <InputCheckbox
        label="Use Unified Timing"
        v-model="unifiedDelay"
      />
      <InputNumber
        :disabled="!unifiedDelay"
        :label="'Unified Timing'"
        v-model="unifiedDelayTime"
      />
    </div>
    <div
      v-if="currentTab === 'Frames'"
      class="flex flex-col"
    >
      <div class="flex flex-nowrap overflow-x-scroll gap-2 px-2 pb-2">
        <div
          :key="index"
          v-for="(frame, index) in frames"
          :class="[
            currentFrame === index ? 'border-blue-500' : 'border-transparent',
            unifiedDelay ? 'pb-3' : '',
          ]"
          class="relative shrink-0 w-32 flex flex-col gap-2 items-center rounded-lg p-1 border-2
            shadow-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-300 hover:dark:bg-gray-500"
        >
          <div class="flex justify-between self-stretch pl-2">
            <span class="text-gray-900 dark:text-gray-50 w-8">{{ index + 1 }}</span>
            <!-- <DropdownComponent -->
            <!--   :options="[ -->
            <!--     { -->
            <!--       name: 'Add Before', -->
            <!--       value: '', -->
            <!--     }, -->
            <!--   ]" -->
            <!-- > -->
            <!-- </DropdownComponent> -->
          </div>
          <img
            :src="frame.url"
            class="h-10 object-contain pixel"
          />
          <InputNumber
            v-if="!unifiedDelay"
            :label="'Delay'"
            v-model="frame.delay"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped></style>
