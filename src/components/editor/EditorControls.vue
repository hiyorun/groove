<script setup lang="ts">
  import InputButton from '../input/InputButton.vue';
  import InputSlider from '../input/InputSlider.vue';
  export type PlayerActions = 'first' | 'prev' | 'toggle' | 'next' | 'last';

  const currentFrame = defineModel<number>('currentFrame', { default: 0 });

  defineProps<{
    frameCount: number;
    isPlaying: boolean;
  }>();

  const emit = defineEmits<{
    (e: 'action', value: PlayerActions): void;
  }>();
</script>
<template>
  <div class="flex flex-col justify-center m-2 gap-2">
    <div class="text-sm text-gray-700 dark:text-gray-300">
      Frame {{ currentFrame + 1 }}/{{ frameCount }}
    </div>
    <div class="">
      <InputSlider
        :min="0"
        :max="frameCount - 1"
        :step="1"
        v-model="currentFrame"
        show-ticks
      />
    </div>
    <div class="inline-flex gap-2 self-center">
      <InputButton
        @click="emit('action', 'first')"
        size="sm"
      >
        <span class="material-symbols-outlined"> first_page </span>
      </InputButton>
      <InputButton
        @click="emit('action', 'prev')"
        size="sm"
      >
        <span class="material-symbols-outlined"> chevron_backward </span>
      </InputButton>
      <InputButton
        @click="emit('action', 'toggle')"
        size="sm"
      >
        <span
          v-if="isPlaying"
          class="material-symbols-outlined"
        >
          pause
        </span>
        <span
          v-else
          class="material-symbols-outlined"
        >
          play_arrow
        </span>
      </InputButton>
      <InputButton
        @click="emit('action', 'next')"
        size="sm"
      >
        <span class="material-symbols-outlined"> chevron_forward </span>
      </InputButton>
      <InputButton
        @click="emit('action', 'last')"
        size="sm"
      >
        <span class="material-symbols-outlined"> last_page </span>
      </InputButton>
    </div>
  </div>
</template>
