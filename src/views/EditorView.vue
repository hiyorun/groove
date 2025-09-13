<script setup lang="ts">
  import { computed } from 'vue';
  import EditorForms from '@/components/editor/EditorForms.vue';
  import EditorPreview from '@/components/editor/EditorPreview.vue';
  import EditorViewer from '@/components/editor/EditorViewer.vue';
  import InputSelect, { type SelectOption } from '@/components/input/InputSelect.vue';
  import { useCursorStore } from '@/stores/cursorStore';
  import { useEditorStore } from '@/stores/editorStore';
  import type { Definition } from '@/lib/groove';
  import EditorActions from '@/components/editor/EditorActions.vue';
  import { xcursorHandler } from '@/handlers/xcursor';
  import { useModal } from '@/composables/useModal';
  import { Modal } from '@/composables/types';
  import ConfirmationModal, {
    type ConfirmationModalProps,
  } from '@/components/common/ConfirmationModal.vue';
import { useCursorController } from '@/composables/useCursorAnimation';
import { hyprcursorHandler } from '@/handlers/hyprcursor';

  const cursorStore = useCursorStore();
  const editorStore = useEditorStore();
  const controller = useCursorController()
  const modal = useModal();

  const sizeTab = computed<SelectOption<number>[]>(() => {
    return cursorStore.sizes.map((size) => ({
      name: size.toString(),
      value: size,
      active: size === editorStore.selectedSize,
      disabled: false,
    }));
  });

  const currentDefinition = computed(() => {
    return cursorStore.getDefinition(editorStore.selectedSize);
  });

  const currentFrames = computed(() => {
    return cursorStore.getFrames(editorStore.selectedSize);
  });

  const currentFrame = computed(() => {
    return currentFrames.value[editorStore.frame] ?? null;
  });

  function changeSizeGroup(evt: Event) {
    const target = evt.target as HTMLSelectElement;
    const value = parseInt(target.value);
    editorStore.selectedSize = value;
  }

  function handleDefinitionUpdate(definition: Definition | undefined) {
    if (definition) {
      cursorStore.updateDefinition(editorStore.selectedSize, definition);
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
      controller.dispose()
    } catch (reason) {
      console.log('User cancelled', reason);
      return;
    }
  }
</script>
<template>
  <div class="w-full h-full">
    <div class="flex flex-col md:flex-row gap-3 w-full h-full">
      <div class="flex flex-col">
        <div
          class="flex justify-between items-baseline p-3 mb-3 gap-3 shadow-md rounded-lg bg-gray-50
            dark:bg-gray-700"
        >
          Size:
          <InputSelect
            :options="sizeTab"
            @change="changeSizeGroup"
          />
        </div>
        <div class="grid grid-cols-2 md:grid-cols-1 gap-3 h-full justify-items-center">
          <EditorViewer
            :definition="currentDefinition"
            :frame="currentFrame"
            :frame-number="editorStore.frame"
            :hotspot-hint="editorStore.hotspotHint"
            :dark="editorStore.dark"
            :selected-size="editorStore.selectedSize"
            class="shadow-md rounded-lg"
          />
          <EditorPreview
            :definition="currentDefinition"
            :frame="currentFrame"
            :dark="editorStore.dark"
            @toggle-dark="editorStore.dark = !editorStore.dark"
            class="shadow-md rounded-lg"
          />
        </div>
      </div>
      <div class="gap-3 grow w-full md:w-2/3 flex flex-col">
        <div class="grow shadow-md rounded-lg bg-gray-50 dark:bg-gray-700 overflow-scroll">
          <EditorForms
            :definition="currentDefinition"
            :frames="currentFrames"
            :current-frame="editorStore.frame"
            @update:definition="handleDefinitionUpdate"
            @update:hotspot-hint="editorStore.hotspotHint = $event"
          />
        </div>
        <div class="shadow-md rounded-lg bg-gray-50 dark:bg-gray-700">
          <EditorActions @export="exportCursor" @close="close"/>
        </div>
      </div>
    </div>
  </div>
</template>
