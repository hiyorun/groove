<script setup lang="ts">
  import { computed } from 'vue';
  import EditorForms from '@/components/editor/EditorForms.vue';
  import EditorPreview from '@/components/editor/EditorPreview.vue';
  import EditorViewer from '@/components/editor/EditorViewer.vue';
  import InputSelect, { type SelectOption } from '@/components/input/InputSelect.vue';
  import { useCursorStore } from '@/stores/cursorStore';
  import { useEditorStore } from '@/stores/editorStore';
  import type { CursorHotspot } from '@/lib/groove';
  import EditorActions from '@/components/editor/EditorActions.vue';
  import { xcursorHandler } from '@/handlers/xcursor';
  import { useModal } from '@/composables/useModal';
  import { Modal } from '@/composables/types';
  import ConfirmationModal, {
    type ConfirmationModalProps,
  } from '@/components/common/ConfirmationModal.vue';
  import { useCursorController } from '@/composables/useCursorController';
  import { hyprcursorHandler } from '@/handlers/hyprcursor';
  import { mscursorHandler } from '@/handlers/mscursor';
  import { msaniHandler } from '@/handlers/msani';

  const cursorStore = useCursorStore();
  const editorStore = useEditorStore();
  const controller = useCursorController();
  const modal = useModal();

  const sizeTab = computed<SelectOption<number>[]>(() => {
    return cursorStore.sizes.map((size) => ({
      name: size.toString(),
      value: size,
      active: size === editorStore.selectedSize,
      disabled: false,
    }));
  });

  const currentCursorHotspot = computed(() => {
    return cursorStore.getCursorHotspot;
  });

  const currentFrames = computed(() => {
    return cursorStore.getFrames(editorStore.selectedSize);
  });

  const currentFrame = computed(() => {
    return currentFrames.value[editorStore.frame] ?? null;
  });

  function handleHotspotUpdate(hotspot: CursorHotspot | undefined) {
    if (hotspot) {
      cursorStore.updateHotspot(hotspot);
    }
  }

  function exportCursor(val: string) {
    switch (val) {
      case 'xcursor':
        cursorStore.make(xcursorHandler);
        break;
      case 'hyprcursor':
        cursorStore.make(hyprcursorHandler);
        break;
      case 'mscursor':
        cursorStore.make(mscursorHandler);
        break;
      case 'msani':
        cursorStore.make(msaniHandler);
        break;
      default:
        console.log('Unimplemented');
        break;
    }
  }

  async function close() {
    try {
      const closeConfirm = new Modal<ConfirmationModalProps>(ConfirmationModal, {
        title: 'Close Cursor',
        message: 'Any unsaved changes will be discarded.',
        confirmText: 'OK',
        cancelText: 'Cancel',
      });

      await modal.openModal(closeConfirm);
      controller.dispose();
    } catch (reason) {
      console.log('User cancelled', reason);
      return;
    }
  }
</script>
<template>
  <div class="w-full h-full p-3">
    <div class="flex flex-col gap-3 w-full h-full">
      <div class="flex flex-col grow">
        <div
          class="flex justify-between items-baseline p-3 mb-3 gap-3 shadow-md rounded-lg bg-gray-50
            dark:bg-gray-700"
        >
          Size:
          <InputSelect
            :options="sizeTab"
            v-model.number="editorStore.selectedSize"
          />
        </div>
        <div class="flex gap-3 h-full justify-items-center">
          <EditorViewer
            :cursor-hotspot="currentCursorHotspot"
            :frame="currentFrame"
            :frame-number="editorStore.frame"
            :hotspot-hint="editorStore.hotspotHint"
            :dark="editorStore.dark"
            :selected-size="editorStore.selectedSize"
            class="shadow-md rounded-lg"
          />
          <EditorPreview
            :cursor-hotspot="currentCursorHotspot"
            :frame="currentFrame"
            :dark="editorStore.dark"
            @toggle-dark="editorStore.dark = !editorStore.dark"
            class="shadow-md rounded-lg"
          />
        </div>
      </div>
      <div class="gap-3 w-full flex flex-col">
        <div class="grow shadow-md rounded-lg bg-gray-50 dark:bg-gray-700 overflow-scroll">
          <EditorForms
            :cursor-hotspot="currentCursorHotspot"
            :frames="currentFrames"
            :current-frame="editorStore.frame"
            @update:cursor-hotspot="handleHotspotUpdate"
            @update:hotspot-hint="editorStore.hotspotHint = $event"
          />
        </div>
        <div class="shadow-md rounded-lg bg-gray-50 dark:bg-gray-700">
          <EditorActions
            :frame-length="currentFrames.length"
            @export="exportCursor"
            @close="close"
          />
        </div>
      </div>
    </div>
  </div>
</template>
