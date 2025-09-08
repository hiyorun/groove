<script setup lang="ts">
  import { useModal } from '@/composables/useModal';

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
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
    <h2 class="text-xl font-bold mb-3">{{ title }}</h2>
    <p class="mb-6">{{ message }}</p>
    <div class="flex justify-end gap-3">
      <button
        @click="handleCancel"
        class="px-4 py-2 rounded-md text-gray-800 dark:text-white hover:bg-gray-100
          hover:dark:bg-gray-700 cursor-pointer"
      >
        {{ cancelText }}
      </button>
      <button
        @click="handleConfirm"
        class="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
      >
        {{ confirmText }}
      </button>
    </div>
  </div>
</template>
