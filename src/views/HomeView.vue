<script setup lang="ts">
  import InputFileDrop from '@/components/input/InputFileDrop.vue';
  import { useCursorController } from '@/composables/useCursorAnimation';
  import { handler } from '@/handlers';
  import type { CursorHandler } from '@/lib/groove';
  import { useCursorStore } from '@/stores/cursorStore';
  import { useEditorStore } from '@/stores/editorStore';

  const cursorStore = useCursorStore();
  const editorStore = useEditorStore();
  const controller = useCursorController();

  async function upload(evt: Event) {
    const target = evt.target as HTMLInputElement;
    const files = target.files;

    if (!files || files.length === 0) return;

    const file = files[0];

    const handlers: CursorHandler[] = [
      handler.xcursor,
      handler.hyprcursor,
      handler.mscursor,
      handler.msani,
    ];

    let selectedHandler: (typeof handlers)[0] | null = null;

    for (const h of handlers) {
      try {
        const handled = await cursorStore.ident(h, file);
        if (handled) {
          selectedHandler = h;
          break;
        }
      } catch (err) {
        console.error('Ident failed for handler:', h, err);
      }
    }

    if (!selectedHandler) {
      console.error('No handler could identify the file.');
      editorStore.ready = true;
      return;
    }

    try {
      const initialSize = await cursorStore.parse(selectedHandler, file);
      editorStore.selectedSize = initialSize;
      controller.startFrameCounter();
    } catch (err) {
      console.error('Parse failed:', err);
    } finally {
      console.log('Parsing is done, closing file picker.');
      editorStore.ready = true;
    }
  }
</script>
<template>
  <div class="flex flex-col gap-3 w-full h-full">
    <div class="pt-3 px-5">
      <h1 class="text-xl font-bold">Groove</h1>
    </div>
    <div class="flex flex-grow px-3 pb-3">
      <div class="flex-grow shadow-md rounded-lg p-3 bg-gray-50 dark:bg-gray-700">
        <InputFileDrop
          :title="'Drop your cursor here'"
          :accept-badge="['Hyprcursor', 'Xcursor', 'Windows Animated Cursor', 'Windows Cursor']"
          @change="upload"
        />
      </div>
    </div>
  </div>
</template>
