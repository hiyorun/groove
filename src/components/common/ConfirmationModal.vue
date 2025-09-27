<script setup lang="ts">
  import { useModal } from '@/composables/useModal';
import InputButton from '../input/InputButton.vue';

  export type ConfirmationModalProps = {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
  };

  const { resolveModal, rejectModal } = useModal();

  const {
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
  } = defineProps<ConfirmationModalProps>();

  const handleConfirm = () => {
    resolveModal(undefined);
  };

  const handleCancel = () => {
    rejectModal('User cancelled');
  };
</script>

<template>
  <div class="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md">
    <h2 class="text-xl font-bold mb-3">{{ title }}</h2>
    <p class="mb-6">{{ message }}</p>
    <div class="flex justify-end gap-3">
      <InputButton
        @click="handleCancel"
        outlined
      >
        {{ cancelText }}
      </InputButton>
      <InputButton
        @click="handleConfirm"
      >
        {{ confirmText }}
      </InputButton>
    </div>
  </div>
</template>
