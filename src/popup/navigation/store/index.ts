import {computed, ComputedRef, ref} from 'vue';
import Transcript from "@/subtitle/pages/Transcript.vue";
import Settings from "@/settings/pages/Settings.vue";
import SelectSubtitle from "@/select/pages/SelectSubtitle.vue";
import Home from "@/home/pages/Home.vue";
import {ApiStore} from "@/api/store";

export type NavigationState = {
  name: 'HOME' | 'SETTINGS' | 'TRANSCRIPT' | 'SELECT_SUBTITLE';
  params: any;
  component: any;
};

export interface ToHomePayload {
  contentTransitionName: 'content-navigate-shallow' | 'content-navigate-select-to-home';
}

export interface ToSettingsPayload {
  contentTransitionName: 'content-navigate-deeper';
}

export interface ToTranscriptPayload {
  contentTransitionName: 'content-navigate-deeper';
}

export interface ToSelectSubtitlePayload {
  contentTransitionName: 'content-navigate-deeper';
}

export interface NavigationStore {
  state: ComputedRef<NavigationState>;
  actions: {
    toHome: (params?: ToHomePayload) => void;
    toSettings: (params?: ToSettingsPayload) => void;
    toTranscript: (params?: ToTranscriptPayload) => void;
    toSelectSubtitle: (params?: ToSelectSubtitlePayload) => void;
  };
}

interface InitPayload {
  use: {
    apiStore: ApiStore
  }
}


export const init = ({use}: InitPayload): NavigationStore => {

  const component = computed(() => {
    if (state.value.name === 'TRANSCRIPT') {
      return Transcript;
    } else if (state.value.name === 'SETTINGS') {
      return Settings;
    } else if (state.value.name === 'SELECT_SUBTITLE') {
      return SelectSubtitle;
    } else {
      return Home;
    }
  });

  const state = ref<NavigationState>({
    name: 'HOME',
    params: {},
    component
  });

  return {
    state: computed(() => state.value),
    actions: {
      toHome: (params: ToHomePayload = {contentTransitionName: 'content-navigate-shallow'}): void => {
        state.value = {name: 'HOME', params, component};
      },
      toSettings: (params: ToSettingsPayload =  { contentTransitionName: 'content-navigate-deeper'}): void => {
        state.value = {name: 'SETTINGS', params, component};
      },
      toTranscript: (params: ToTranscriptPayload = {contentTransitionName: 'content-navigate-deeper'}): void => {
        state.value = {name: 'TRANSCRIPT', params, component};
      },
      toSelectSubtitle: (params: ToSelectSubtitlePayload = {contentTransitionName: 'content-navigate-deeper'}): void => {
        state.value = {name: 'SELECT_SUBTITLE', params, component};
      }
    }
  };
};
