import { get as storageGet, remove as storageRemove } from 'storage';
import { init as initLoginStore } from '@@/login/store';
import { provide, watch } from 'vue';
import { init as initSelectStore } from '@@/selectSubtitle/store';
import { init as initSubtitleStore } from '@/subtitle/store';
import { init as initAppStore } from '@/app/store';
import { init as initContentScriptStore } from '@/contentScript/store';
import { init as initVideoStore } from '@/video/store';
import { init as initAppearanceStore } from '@/appearance/store';

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
  const { redirected, style } = await storageGet<Entry>(['redirected', 'style']);
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

  const appearanceStore = initAppearanceStore({ use: { contentScriptStore }, initStyle: style ?? {} });
  const videoStore = initVideoStore({ use: { contentScriptStore, appearanceStore } });

  contentScriptStore.actions.requestAllContentScriptsToRegister();
  // document.querySelector('video')!.dataset.plusSubStatus = 'selected';


  watch([loginStore.getters.initialized], async ([init]) => {
    if(!init){
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
    // await videoStore.actions.setCurrent({ video: list[0]});
    document.querySelector('video')!.dataset.plusSubStatus = 'selected';
    setTimeout(() => {
      appStore.actions.setState({ state: 'SELECTED' });
      appStore.actions.setSrc({ src: 'SEARCH' });
      videoStore.actions.addVtt({subtitles: subtitleStore.state.value.parsed, subtitleId: redirected.id, language: "en" });
    }, 500);
  });
  await storageRemove(['redirected']);
})();

