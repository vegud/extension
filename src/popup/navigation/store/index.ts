import {computed, ComputedRef, ref} from 'vue';
import Transcript from "@/subtitle/pages/Transcript.vue";
import Settings from "@/settings/pages/Settings.vue";
import SelectSubtitle from "@/selectSubtitle/pages/SelectSubtitle.vue";
import Login from "@/login/pages/Login.vue";
import Home from "@/home/pages/Home.vue";
import Tutorial from "@/tutorial/pages/Tutorial.vue";

export type NavigationState = {
  name: 'HOME' | 'SETTINGS' | 'TRANSCRIPT' | 'SELECT_SUBTITLE' | 'LOGIN' | 'TUTORIAL';
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

export interface ToLoginPayload {
  contentTransitionName: 'content-navigate-deeper';
}

export interface ToTutorialPayload {
  contentTransitionName: 'content-navigate-deeper';
}

export interface NavigationStore {
  state: ComputedRef<NavigationState>;
  actions: {
    toTutorial: (params?: ToTutorialPayload) => void;
    toHome: (params?: ToHomePayload) => void;
    toSettings: (params?: ToSettingsPayload) => void;
    toTranscript: (params?: ToTranscriptPayload) => void;
    toSelectSubtitle: (params?: ToSelectSubtitlePayload) => void;
    toLogin: (params?: ToLoginPayload) => void;
  };
}


export const init = (): NavigationStore => {

  const component = computed(() => {
    if (state.value.name === 'TRANSCRIPT') {
      return Transcript;
    } else if (state.value.name === 'SETTINGS') {
      return Settings;
    } else if (state.value.name === 'SELECT_SUBTITLE') {
      return SelectSubtitle;
    } else if (state.value.name === 'LOGIN') {
      return Login;
    } else if (state.value.name === 'TUTORIAL') {
      return Tutorial;
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
      toSettings: (params: ToSettingsPayload = { contentTransitionName: 'content-navigate-deeper'}): void => {
        state.value = {name: 'SETTINGS', params, component};
      },
      toTranscript: (params: ToTranscriptPayload = {contentTransitionName: 'content-navigate-deeper'}): void => {
        state.value = {name: 'TRANSCRIPT', params, component};
      },
      toSelectSubtitle: (params: ToSelectSubtitlePayload = {contentTransitionName: 'content-navigate-deeper'}): void => {
        state.value = {name: 'SELECT_SUBTITLE', params, component};
      },
      toLogin: (params: ToLoginPayload = {contentTransitionName: 'content-navigate-deeper'}): void => {
        state.value = {name: 'LOGIN', params, component};
      },
      toTutorial: (params: ToTutorialPayload = {contentTransitionName: 'content-navigate-deeper'}): void => {
        state.value = {name: 'TUTORIAL', params, component};
      }
    }
  };
};
