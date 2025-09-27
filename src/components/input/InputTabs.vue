<script setup lang="ts">
  import { computed, ref } from 'vue';
  import type { SelectOption } from './InputSelect.vue';
  import InputSelect from './InputSelect.vue';
  import { useUniqueID } from '@/composables/useUniqueID';

  const props = defineProps<{
    tabs: string[];
    modelValue: string;
    id?: string;
  }>();

  const emit = defineEmits(['update:modelValue']);

  const activeTab = computed({
    get: () => props.modelValue,
    set: (value: string) => {
      emit('update:modelValue', value);
    },
  });

  const inputID = useUniqueID('tabs', props.id);

  const selectOptions = computed<SelectOption<string>[]>(() =>
    props.tabs.map((tab) => ({
      name: tab,
      value: tab,
      active: tab === props.modelValue,
      disabled: false,
    })),
  );

  const tabRefs = ref<(HTMLButtonElement | null)[]>([]);

  function selectTab(tab: string) {
    activeTab.value = tab;
  }

  function handleKeydown(event: KeyboardEvent, index: number) {
    const total = props.tabs.length;
    let newIndex = index;

    switch (event.key) {
      case 'ArrowRight':
        newIndex = (index + 1) % total;
        break;
      case 'ArrowLeft':
        newIndex = (index - 1 + total) % total;
        break;
      case 'Home':
        newIndex = 0;
        break;
      case 'End':
        newIndex = total - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    const newTab = props.tabs[newIndex];
    selectTab(newTab);
    tabRefs.value[newIndex]?.focus();
  }

  function getTabClasses(tab: string, index: number, total: number): string[] {
    const isActive = tab === props.modelValue;
    return [
      'inline-block w-full p-1 focus:ring-1 focus:ring-blue-300 focus:outline-none transition duration-150 ease-in-out',
      isActive
        ? 'bg-blue-700 text-white dark:bg-blue-600 cursor-default'
        : 'bg-white hover:text-gray-900 hover:bg-gray-50 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-500',
      index < total - 1 ? 'border-r border-gray-200 dark:border-gray-700' : '',
      index === 0 ? 'rounded-s-lg' : '',
      index === total - 1 ? 'rounded-e-lg border-s-0' : '',
    ];
  }
</script>

<template>
  <div>
    <div class="md:hidden">
      <InputSelect
        :options="selectOptions"
        :id="inputID"
        v-model="activeTab"
      />
    </div>

    <ul
      class="hidden text-sm font-medium text-center text-gray-500 rounded-lg shadow-sm md:flex
        dark:divide-gray-700 dark:text-gray-400"
      :id="inputID"
      role="tablist"
    >
      <li
        v-for="(tab, index) in tabs"
        :key="tab"
        class="w-full focus-within:z-10"
        role="presentation"
      >
        <button
          type="button"
          :id="`${inputID}-${index}`"
          role="tab"
          :aria-selected="activeTab === tab"
          :tabindex="activeTab === tab ? 0 : -1"
          :aria-controls="`${inputID}-panel-${index}`"
          ref="tabRefs"
          @click="selectTab(tab)"
          @keydown="handleKeydown($event, index)"
          :class="getTabClasses(tab, index, tabs.length)"
        >
          {{ tab }}
        </button>
      </li>
    </ul>
  </div>
</template>
