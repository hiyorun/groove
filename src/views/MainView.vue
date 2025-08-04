<script setup lang="ts">
import EditorView from './EditorView.vue';
import HomeView from './HomeView.vue';
import { useEditorStore } from '@/stores/editorStore';

const editorStore = useEditorStore();
</script>
<template>
  <div class="w-screen h-screen p-3">
    <HomeView v-if="!editorStore.ready" />
    <EditorView v-else />
  </div>
</template>
