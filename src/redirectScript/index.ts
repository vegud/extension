import { get as storageGet, remove as storageRemove } from 'storage';
import { init as initLoginStore } from '@/login/store';
import { provide, watch } from 'vue';
import { init as initSelectStore } from '@/selectSubtitle/store';
import { init as initSubtitleStore } from '@/subtitle/store';
import { init as initAppStore } from '@/app/store';
import { init as initContentScriptStore } from '@/contentScript/store';
import { init as initVideoStore } from '@/video/store';

export interface Entry {
  provider: string;
  id: string;
  language: string;
  filename: string;
  name: string;
  episode: string;
  path: string;
}
(async () => {
  const { redirected } = await storageGet<Entry>(['redirected']);
  if(!redirected){
    return;
  }
  const url = new URL(window.location.href);
  const isYoutube = url.hostname === 'www.youtube.com';
  const isSameV = url.searchParams.get('v') === redirected.id;
  if(!isYoutube || !isSameV){
    return;
  }
  const loginStore = initLoginStore();
  const selectSubtitleStore = initSelectStore({ loginStore });
  const appStore = initAppStore();
  const subtitleStore = initSubtitleStore({ use: { appStore } });
  const contentScriptStore = initContentScriptStore();
  const videoStore = initVideoStore({ use: { contentScriptStore } });

  contentScriptStore.actions.requestAllContentScriptsToRegister();

  watch([loginStore.getters.initialized, videoStore.getters.list], async ([init, list]) => {
    if(!init || list.length === 0 ){
      return;
    }

    const raw = await selectSubtitleStore.actions.download(redirected.path);
    subtitleStore.actions.setRaw({
      raw,
      format: '.srt',
      id: redirected.id,
      language: 'en'
    });
    subtitleStore.actions.parse();
    videoStore.actions.setCurrent({ video: list[0]});
    appStore.actions.setState({ state: 'SELECTED' });
    appStore.actions.setSrc({ src: 'SEARCH' });
    videoStore.actions.addVtt({subtitles: subtitleStore.state.value.parsed, subtitleId: redirected.id, language: "en" });
    contentScriptStore.actions.unmount();
  });
  // await storageRemove(['redirected']);
})();

