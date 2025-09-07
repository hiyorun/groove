<script setup lang="ts">
  import { useModalStore } from '@/stores/modalStore';

  const modalStore = useModalStore();

  const closeModal = () => {
    modalStore.closeModal();
  };
</script>

<template>
  <Teleport to="body">
    <div
      v-if="modalStore.show && modalStore.activeModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      @click.self="closeModal"
    >
      <component
        :is="modalStore.activeModal.component"
        v-bind="modalStore.activeModal.props"
      />
    </div>
  </Teleport>
</template>
