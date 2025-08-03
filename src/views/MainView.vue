<script setup lang="ts">
import { useCursorStore } from '@/stores/cursorStore';
import EditorView from './EditorView.vue';
import HomeView from './HomeView.vue';

const store = useCursorStore();
</script>
<template>
  <div class="w-screen h-screen p-3">
    <HomeView v-if="!store.ready"/>
    <EditorView v-else/>
  </div>
</template>
