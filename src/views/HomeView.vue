<script setup lang="ts">
import InputFileDrop from '@/components/input/InputFileDrop.vue';
import { useCursorController } from '@/composables/useCursorAnimation';
import { handler } from '@/handlers';
import { useCursorStore } from '@/stores/cursorStore';

const store = useCursorStore();
const controller = useCursorController();

function upload(evt: Event) {
  const target = evt.target as HTMLInputElement;
  const files = target.files;
  if (files && files.length > 0) {
    store
      .ident(handler.xcursor, files[0])
      .then((isXCursor) => {
        if (!isXCursor) {
          window.alert('Not an xcursor file');
          return;
        }
        try {
          store.parse(handler.xcursor, files[0]).then(() => {
            controller.startFrameCounter();
          });
        } catch (err) {
          console.error(err);
        }
      })
      .finally(() => {
        store.ready = true;
      });
  }
}
</script>
<template>
  <div>
    <InputFileDrop @change="upload" />
  </div>
</template>
