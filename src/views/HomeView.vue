<script setup lang="ts">
import InputFileDrop from '@/components/input/InputFileDrop.vue';
import { useCursorController } from '@/composables/useCursorAnimation';
import { handler } from '@/handlers';
import { useCursorStore } from '@/stores/cursorStore';
import { useEditorStore } from '@/stores/editorStore';

const cursorStore = useCursorStore();
const editorStore = useEditorStore();
const controller = useCursorController();

function upload(evt: Event) {
  const target = evt.target as HTMLInputElement;
  const files = target.files;
  if (files && files.length > 0) {
    const file = files[0];
    cursorStore.ident(handler.xcursor, file).then((isXCursor) => {
      if (!isXCursor) {
        window.alert('Not an xcursor file');
        return;
      }
      try {
        cursorStore.parse(handler.xcursor, file).then((initialSize) => {
          editorStore.selectedSize = initialSize;
          controller.startFrameCounter();
        });
      } catch (err) {
        console.error(err);
      } finally {
        editorStore.ready = true;
      }
    });
  }
}
</script>
<template>
  <div>
    <InputFileDrop @change="upload" />
  </div>
</template>
