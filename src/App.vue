<script setup lang="ts">
  import MainView from './views/MainView.vue';
  import ModalComponent from '@/components/common/ModalComponent.vue';
</script>

<template>
  <main class="bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-50 relative">
    <ModalComponent />
    <MainView />
  </main>
</template>

<style scoped></style>
