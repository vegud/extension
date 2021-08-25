import { computed, ComputedRef, Ref, ref } from 'vue';
import { get as storageGet, set as storageSet } from 'storage';

export interface TutorialStore {
  actions: {
    skip: (payload: {doNotShowAgain: boolean}) => void
  };
  getters: {
    initialized: ComputedRef<boolean>;
    watched: ComputedRef<boolean>;
  }
}

declare global {
  interface Window {
    plusSub_tutorial: Ref<{watched: boolean}>
  }
}


export const init = (): TutorialStore => {
  window.plusSub_tutorial = window.plusSub_tutorial ? ref(window.plusSub_tutorial.value) : ref<{watched: boolean}>({
    watched: false,
  });

  const initialized = ref(false);

  storageGet(['doNotShowTutorialAgain']).then(async ({doNotShowTutorialAgain}) => {
    if(doNotShowTutorialAgain) {
      window.plusSub_tutorial.value.watched = doNotShowTutorialAgain;
    }
    initialized.value = true;
  });

  return {
    actions: {
      skip: async ({ doNotShowAgain }: { doNotShowAgain: boolean }) => {
        window.plusSub_tutorial.value.watched = true;
        await storageSet({
          doNotShowTutorialAgain: doNotShowAgain
        });
      }
    },
    getters: {
      initialized: computed(() => initialized.value),
      watched: computed(() => window.plusSub_tutorial.value.watched)
    }
  };
};
