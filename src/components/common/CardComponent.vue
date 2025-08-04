<template>
  <div
    class="p-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700"
  >
    <a
      v-if="$slots.header"
      href="#"
    >
      <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
        <slot name="header" />
      </h5>
    </a>
    <p
      v-if="$slots.default"
      class="w-full h-full mb-3 font-normal text-gray-700 dark:text-gray-400"
    >
      <slot />
    </p>
  </div>
</template>
