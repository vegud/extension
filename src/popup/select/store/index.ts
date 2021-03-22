import { computed, ComputedRef, ref, UnwrapRef } from 'vue';

export interface SelectState {
  accessToken: string;
}


export interface SelectStore {
  state: ComputedRef<SelectState>;
  actions: {
    list: () => Promise<string[]>
    download: (entry: string) => Promise<string>
  }
}


export const init = ({ accessToken }: Pick<UnwrapRef<SelectState>, 'accessToken'>): SelectStore => {
  const state = ref<SelectState>({ accessToken });

  return {
    state: computed(() => state.value),
    actions: {
      list: async () => {
        return fetch(`https://5m1ansbaba.execute-api.eu-west-1.amazonaws.com/list`, {
          headers: {
            Authorization: `${accessToken}`
          }
        }).then(r => r.json());
      },
      download: async (entry: string) => {
        return fetch(`https://5m1ansbaba.execute-api.eu-west-1.amazonaws.com/get?key=${entry}`, {
          headers: {
            Authorization: `${accessToken}`
          }
        }).then(r => r.text());
      }
    }
  };
};