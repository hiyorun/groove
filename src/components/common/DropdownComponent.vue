<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';

  export type DropdownAction<T> = {
    name: string;
    value: T;
    active?: boolean;
    icon?: string;
    disabled?: boolean;
  };

  const open = ref(false);
  const menuPosition = ref({ top: 0, left: 0 });

  const { options } = defineProps<{
    options: DropdownAction<unknown>[];
  }>();

  const emits = defineEmits<{
    toggle: [val: boolean];
    change: [val: unknown];
  }>();

  const toggleRef = ref<HTMLElement | null>(null);
  const focusIndex = ref(-1);

  function updateMenuPosition() {
    if (!toggleRef.value) return;

    const rect = toggleRef.value.getBoundingClientRect();
    const menuEl = document.getElementById('dropdown-menu');

    const menuWidth = menuEl?.offsetWidth || 200;
    const menuHeight = menuEl?.offsetHeight || options.length * 36;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let top = rect.bottom + window.scrollY; // bottom center default
    let left = rect.left + window.scrollX + rect.width / 2 - menuWidth / 2;

    // Flip to top if no space below
    if (vh - rect.bottom < menuHeight && rect.top > menuHeight) {
      top = rect.top + window.scrollY - menuHeight;
    }

    // Shift horizontally if overflowing
    if (left < 0) left = 0;
    if (left + menuWidth > vw) left = vw - menuWidth;

    menuPosition.value = { top, left };
  }

  function toggleMenu() {
    open.value = !open.value;
    emits('toggle', open.value);

    if (open.value) {
      nextTick(() => {
        updateMenuPosition();
        focusIndex.value = 0;
      });
    }
  }

  function selectOption(option: DropdownAction<unknown>) {
    if (!option.disabled) {
      emits('change', option.value);
      open.value = false;
      emits('toggle', false);
    }
  }

  function handleClickOutside(e: MouseEvent) {
    if (
      toggleRef.value
      && !toggleRef.value.contains(e.target as Node)
      && !document.getElementById('dropdown-menu')?.contains(e.target as Node)
    ) {
      open.value = false;
      emits('toggle', false);
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (!open.value) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      focusIndex.value = (focusIndex.value + 1) % options.length;
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      focusIndex.value = (focusIndex.value - 1 + options.length) % options.length;
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      selectOption(options[focusIndex.value]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      open.value = false;
      emits('toggle', false);
    }
  }

  onMounted(() => {
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleKeydown);
    window.addEventListener('resize', updateMenuPosition);
    window.addEventListener('scroll', updateMenuPosition, true);
  });

  onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside);
    document.removeEventListener('keydown', handleKeydown);
    window.removeEventListener('resize', updateMenuPosition);
    window.removeEventListener('scroll', updateMenuPosition, true);
  });
</script>

<template>
  <a
    @click="toggleMenu"
    ref="toggleRef"
  >
    <slot name="dropdown-toggle">
      <button
        type="button"
        class="aspect-square flex justify-center items-center p-1 rounded-full hover:bg-gray-200
          dark:hover:bg-gray-600 focus:bg-gray-200 dark:focus:bg-gray-600"
        aria-haspopup="true"
        :aria-expanded="open"
      >
        <span class="material-symbols-outlined">more_horiz</span>
      </button>
    </slot>
  </a>

  <Teleport to="body">
    <div
      v-if="open"
      id="dropdown-menu"
      class="absolute w-44 bg-white dark:bg-gray-700 rounded-md shadow-lg ring-1 ring-black/5 z-50"
      :style="{ top: menuPosition.top + 'px', left: menuPosition.left + 'px' }"
    >
      <ul class="py-1 text-sm text-gray-700 dark:text-gray-200">
        <li
          v-for="(option, idx) in options"
          :key="idx"
        >
          <button
            @click="selectOption(option)"
            class="w-full flex gap-2 items-center px-4 py-2 hover:bg-gray-100
              dark:hover:bg-gray-600"
            :class="{
              'bg-gray-100 dark:bg-gray-600': idx === focusIndex,
              'opacity-50 cursor-not-allowed': option.disabled,
            }"
            :disabled="option.disabled"
          >
            <span
              v-if="option.icon"
              class="material-icons text-base"
            >
              {{ option.icon }}
            </span>
            {{ option.name }}
          </button>
        </li>
      </ul>
    </div>
  </Teleport>
</template>
