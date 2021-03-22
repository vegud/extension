import {computed, ComputedRef, Ref, ref, UnwrapRef} from 'vue';

export type AppState = {
  state: 'NONE' | 'SELECTED' | 'DOWNLOADING' | 'PARSING' | 'ERROR' | 'DONE';
  src: 'NONE' | 'FILE' | 'SEARCH';
};
// todo: simplfy for vegud
export interface AppStore {
  state: ComputedRef<AppState>;
  actions: {
    setState: (payload: Pick<AppState, 'state'>) => void;
    setSrc: (payload: Pick<AppState, 'src'>) => void;
    reset: () => void;
  };
}

declare global {
  interface Window {
    plusSub_app: Ref<AppState>;
  }
}

export const init = (): AppStore => {
  window.plusSub_app = window.plusSub_app
    ? ref({ ...window.plusSub_app.value })
    : ref<AppState>({
        src: 'NONE',
        state: 'NONE'
      });

  return {
    state: computed(() => window.plusSub_app.value),
    actions: {
      setState: ({ state }: Pick<AppState, 'state'>) => (window.plusSub_app.value.state = state),
      setSrc: ({ src }: Pick<AppState, 'src'>) => (window.plusSub_app.value.src = src),
      reset: () => {
        window.plusSub_app.value.state = "NONE";
        window.plusSub_app.value.src = "NONE";
      }
    }
  };
};
