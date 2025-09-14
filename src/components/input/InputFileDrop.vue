<script setup lang="ts">
  import { ref } from 'vue';
  import BadgeComponent from '../common/BadgeComponent.vue';

  const _inputID = ref<string>(crypto.randomUUID());
  const isDragOver = ref<boolean>(false);

  const emits = defineEmits<{
    change: [value: Event];
  }>();

  const {
    accepts = ['*'],
    acceptBadge = [],
    description = '',
    title = '',
    subtitle = '',
  } = defineProps<{
    accepts?: string[];
    acceptBadge?: string[];
    description?: string;
    title?: string;
    subtitle?: string;
  }>();

  function unique(id: string): string {
    return id + _inputID.value;
  }

  function upload(evt: Event) {
    emits('change', evt);
  }

  function onDragOver(evt: DragEvent) {
    evt.preventDefault();
    evt.stopPropagation();
    isDragOver.value = true;
  }

  function onDragLeave(evt: DragEvent) {
    evt.preventDefault();
    evt.stopPropagation();
    isDragOver.value = false;
  }

  function onDrop(evt: DragEvent) {
    evt.preventDefault();
    evt.stopPropagation();
    isDragOver.value = false;

    const files = evt.dataTransfer?.files;
    if (files && files.length > 0) {
      const input = document.getElementById(unique('dropzone-file-')) as HTMLInputElement;
      if (input) {
        const dataTransfer = new DataTransfer();
        Array.from(files).forEach((file) => {
          dataTransfer.items.add(file);
        });
        input.files = dataTransfer.files;

        const changeEvent = new Event('change', { bubbles: true });
        Object.defineProperty(changeEvent, 'target', {
          writable: false,
          value: input,
        });
        upload(changeEvent);
      }
    }
  }

  function onDragEnter(evt: DragEvent) {
    evt.preventDefault();
    evt.stopPropagation();
  }
</script>

<template>
  <div class="flex items-center justify-center w-full h-full">
    <label
      :for="unique('dropzone-file-')"
      :class="[
        `flex flex-col items-center justify-center w-full h-full border-2 border-dashed rounded-lg
        cursor-pointer transition-colors duration-200`,
        isDragOver
          ? 'border-blue-400 bg-blue-50 dark:border-blue-500 dark:bg-blue-900/20'
          : `border-gray-300 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600
            dark:hover:border-gray-500 dark:hover:bg-gray-600`,
      ]"
      @dragover="onDragOver"
      @dragleave="onDragLeave"
      @drop="onDrop"
      @dragenter="onDragEnter"
    >
      <div class="flex flex-col items-center justify-center pt-5 pb-6">
        <svg
          class="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 20 16"
        >
          <path
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
          />
        </svg>
        <p class="mb-2 text-sm text-center text-gray-500 dark:text-gray-400">
          <span class="font-semibold">
            {{ isDragOver ? 'Release to upload' : title !== '' ? title : 'Drop files here' }}
          </span>
          <br />
          {{ isDragOver ? '' : subtitle !== '' ? subtitle : 'or click to browse' }}
        </p>
        <p
          v-if="description !== ''"
          class="text-xs text-gray-500 dark:text-gray-400"
        >
          {{ description }}
        </p>
        <div
          class="pt-3 flex flex-wrap justify-center gap-1"
          v-if="!isDragOver"
        >
          <template
            v-for="accept in acceptBadge.length > 0 ? acceptBadge : accepts"
            :key="accept"
          >
            <BadgeComponent
              v-if="accept !== '*'"
              variant="info"
              >{{ accept }}</BadgeComponent
            >
          </template>
        </div>
      </div>
      <input
        :id="unique('dropzone-file-')"
        :accept="accepts.join(',')"
        type="file"
        class="hidden"
        @change="upload"
      />
    </label>
  </div>
</template>
