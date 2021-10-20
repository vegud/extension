import { AppStore } from '@/app/store';
import { SubtitleStore } from '@/subtitle/store';
import { VideoStore } from '@/video/store';
import { NavigationStore } from '@@/navigation/store';
import { SelectSubtitleStore } from '@@/selectSubtitle/store';
import { AppearanceStore } from '@/appearance/store';
import { ContentScriptStore } from '@/contentScript/store';
import { LoginStore } from '@@/login/store';
import { TutorialStore } from '@@/tutorial/store';

export type StoreKey = 'appStore' | 'subtitleStore' | 'videoStore' | 'navigationStore' | 'selectSubtitleStore' | 'appearanceStore' | 'loginStore' | 'tutorialStore' | 'contentScriptStore';

export type Store<T extends StoreKey> = T extends 'appStore'
  ? AppStore
  : T extends 'subtitleStore'
  ? SubtitleStore
  : T extends 'videoStore'
  ? VideoStore
  : T extends 'navigationStore'
  ? NavigationStore
  : T extends 'selectSubtitleStore'
  ? SelectSubtitleStore
  : T extends 'appearanceStore'
  ? AppearanceStore
  : T extends 'contentScriptStore'
  ? ContentScriptStore
  : T extends 'loginStore'
  ? LoginStore
  : T extends 'tutorialStore'
  ? TutorialStore
  : unknown;
