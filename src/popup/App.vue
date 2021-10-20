<template>
  <div class="h-auto overflow-hidden grid app--container">
    <component v-if='initialized' :is="navigationState.component" v-bind="navigationState.params" />
    <Loading v-else/>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onUnmounted, PropType, provide, watch } from 'vue';
import { init as initAppStore } from '@/app/store';
import { init as initContentScriptStore } from '@/contentScript/store';
import { init as initVideoStore } from '@/video/store';
import { init as initSubtitleStore } from '@/subtitle/store';
import { init as initNavigationStore } from '@@/navigation/store';
import { init as initSelectStore } from '@@/selectSubtitle/store';
import { init as initAppearanceStore } from '@/appearance/store';
import { init as initLoginStore } from '@@/login/store';
import { init as initTutorialStore } from '@@/tutorial/store';

import Home from '@@/home/pages/Home.vue';
import Loading from '@@/loading/pages/Loading.vue';
import Transcript from '@@/subtitle/pages/Transcript.vue';
import Settings from '@@/settings/pages/Settings.vue';
import '@@/styles.css';
import { Subject } from 'rxjs';
import { close } from '@@/Toolbar/close';

export default defineComponent({
  components: {
    Loading,
    Home,
    Transcript,
    Settings
  },
  props: {
    preferredLanguage: {
      type: String as PropType<string>,
      required: true
    },
    style: {
      type: Object as PropType<Record<string, string>>,
      required: true
    }
  },
  setup(props) {
    const appStore = initAppStore();
    provide('appStore', appStore);
    const loginStore = initLoginStore();
    provide('loginStore', loginStore);
    const selectSubtitleStore = initSelectStore({ loginStore });
    provide('selectSubtitleStore', selectSubtitleStore);
    const navigationStore = initNavigationStore();
    provide('navigationStore', navigationStore);
    const subtitleStore = initSubtitleStore({ use: { appStore } });
    provide('subtitleStore', subtitleStore);
    const contentScriptStore = initContentScriptStore();
    const appearanceStore = initAppearanceStore({ use: { contentScriptStore }, initStyle: props.style });
    provide('appearanceStore', appearanceStore);
    const videoStore = initVideoStore({ use: { contentScriptStore, appearanceStore } });
    provide('videoStore', videoStore);
    const tutorialStore = initTutorialStore();
    provide('tutorialStore', tutorialStore);

    //detect youtube video change:
    window.document.addEventListener('transitionend', (e: TransitionEvent) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (e.target?.id === 'progress') {
        appStore.actions.reset();
        subtitleStore.actions.reset();
        videoStore.actions.removeCurrent();
      }
    });

    document.onfullscreenchange = () => close();

    const unmountSubject = new Subject<undefined>();
    contentScriptStore.actions.requestAllContentScriptsToRegister();
    // todo:
    // contentScriptStore.state.messageObservable.pipe(
    //   filter((e) => e.data.plusSubActionFromContentScript === 'ADJUST_POPUP'),
    //   tap(() => document.documentElement.style.setProperty('--plusSub-shadow-top', `${window.scrollY + 30}px`)),
    //   takeUntil(unmountSubject)
    // );

    watch(
      () => videoStore.getters.current.value,
      (video) => {
        if (video === null) {
          appStore.actions.reset();
          subtitleStore.actions.reset();
        }
      }
    );

    watch(
      () => subtitleStore.state.value.withOffsetParsed,
      (subtitles) => {
        const subtitleId = subtitleStore.state.value.id;
        if (!subtitleId) {
          console.warn('subtitleId is null');
          return;
        }
        videoStore.actions.addVtt({ subtitles, subtitleId, language: subtitleStore.state.value.language ?? 'en' });
      }
    );

    onUnmounted(() => unmountSubject.next(undefined));

    const initialized = computed(() => loginStore.getters.initialized.value && tutorialStore.getters.initialized.value);

    watch(
      [initialized, loginStore.getters.login, tutorialStore.getters.watched, videoStore.getters.count, appStore.state, videoStore.getters.list, videoStore.getters.current],
      ([initialized, login, tutorialWatched, videoCount, appState, videoList], [_, __,prevTutorialWatched, prevVideoCount]) => {
        if(!initialized){
          return;
        }
        if (!login?.loggedIn) {
          navigationStore.actions.toLogin();
          return;
        }
        if (!tutorialWatched) {
          navigationStore.actions.toTutorial();
          return;
        }

        // navigate if only 1 video exists
        if (videoCount === 1 && videoList[0] &&  ['HOME', 'TUTORIAL', 'LOGIN'].includes(navigationStore.state.value.name)  && appState.state === 'NONE') {
          videoStore.actions.setCurrent({ video: videoList[0] });
          navigationStore.actions.toSelectSubtitle();
          return;
        }

        if (videoCount > 1 && prevVideoCount === 1 && navigationStore.state.value.name === 'SELECT_SUBTITLE' && appState.state === 'NONE') {
          videoStore.actions.removeCurrent();
          navigationStore.actions.toHome();
          return;
        }

        if (videoCount === 0 && navigationStore.state.value.name !== 'HOME') {
          navigationStore.actions.toHome();
          return;
        }

        if (['TUTORIAL', 'LOGIN'].includes(navigationStore.state.value.name)) {
          navigationStore.actions.toHome();
          return;
        }

      },
      { immediate: true }
    );

    return {
      navigationState: navigationStore.state,
      initialized: loginStore.getters.initialized
    };
  }
});
</script>

<style>
:host {
  all: initial;
}
</style>
<style scoped>
.app--container {
  max-width: 400px;
  width: 400px;
  max-height: 1200px;
  min-height: 400px;
  grid-template-rows: auto 1fr;
  grid-template-columns: 100%;
}
</style>
