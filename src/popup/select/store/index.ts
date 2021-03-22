import { computed, ComputedRef, ref, UnwrapRef } from 'vue';

export interface SelectState {
  accessToken: string;
}


export interface SelectStore {
  state: ComputedRef<SelectState>;
}


export const init = ({ accessToken }: Pick<UnwrapRef<SelectState>, 'accessToken'>): SelectStore => {
  const state = ref<SelectState>({ accessToken });

  return {
    state: computed(() => state.value)
  };
};