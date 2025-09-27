import { ref, computed } from 'vue';

export function useUniqueID(prefix: string, customId?: string) {
  const base = ref(crypto.randomUUID());

  return computed(() => customId ?? `${prefix}-${base.value}`);
}
