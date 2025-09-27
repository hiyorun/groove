<script setup lang="ts">
  import type { CursorHotspot, Frame } from '@/lib/groove';
  import InputButton from '../input/InputButton.vue';

  const props = defineProps<{
    cursorHotspot: CursorHotspot | undefined;
    frame: Frame | null;
    dark: boolean;
  }>();

  const emits = defineEmits<{
    toggleDark: [val: boolean];
  }>();
</script>

<template>
  <div
    v-if="frame"
    :class="{ 'bg-white text-gray-900': !props.dark, 'bg-gray-900 text-white': props.dark }"
    :style="`cursor: url(${props.frame?.url}) ${props.cursorHotspot ? props.cursorHotspot.x * frame.width : 0} ${props.cursorHotspot ? props.cursorHotspot.y * frame.height : 0}, pointer`"
    class="w-full p-2 flex flex-col gap-2 relative"
  >
    <InputButton
      @click="emits('toggleDark', !dark)"
      class="absolute top-2 left-2"
    >
      <span
        v-if="props.dark"
        class="material-symbols-outlined"
      >
        light_mode
      </span>
      <span
        v-else
        class="material-symbols-outlined"
      >
        dark_mode
      </span>
    </InputButton>
    <div class="grow preview flex justify-center items-center text-center p-6">
      Hover to preview cursor
    </div>
  </div>
</template>
