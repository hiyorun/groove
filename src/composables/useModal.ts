import { useModalStore } from '@/stores/modalStore';
import type { Modal } from '@/stores/modalStore';

export const useModal = () => {
  const modalStore = useModalStore();

  const openModal = <T extends object, U = void>(modal: Modal<T>): Promise<U> => {
    return new Promise<U>((resolve, reject) => {
      modalStore.openModal(modal, { resolve, reject });
    });
  };

  return {
    openModal,
    resolveModal: modalStore.resolveModal,
    rejectModal: modalStore.rejectModal,
  };
};
