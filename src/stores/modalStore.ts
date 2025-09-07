import { defineStore } from 'pinia';
import { ref, shallowRef } from 'vue';
import type { Component } from 'vue';

export interface Modal<T extends object> {
  component: Component;
  props?: T;
}

interface PromiseHandlers<T> {
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: unknown) => void;
}

export const useModalStore = defineStore('modal', () => {
  const activeModal = shallowRef<Modal<object> | null>(null);
  const show = ref(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const promiseHandlers = ref<PromiseHandlers<any> | null>(null);

  const _reset = () => {
    activeModal.value = null;
    promiseHandlers.value = null;
    show.value = false;
  };

  const openModal = <T extends object, U>(modal: Modal<T>, handlers: PromiseHandlers<U>) => {
    activeModal.value = modal;
    promiseHandlers.value = handlers;
    show.value = true;
  };

  const closeModal = () => {
    if (promiseHandlers.value) {
      promiseHandlers.value.reject('Modal closed prematurely');
    }
    _reset();
  };

  const resolveModal = <T>(value: T) => {
    if (promiseHandlers.value) {
      promiseHandlers.value.resolve(value);
    }
    _reset();
  };

  const rejectModal = (reason?: unknown) => {
    if (promiseHandlers.value) {
      promiseHandlers.value.reject(reason);
    }
    _reset();
  };

  return {
    activeModal,
    show,
    openModal,
    closeModal,
    resolveModal,
    rejectModal,
  };
});
