import { inject } from 'vue';
import { AppStore } from '@/app/store';
import { SubtitleStore } from '@/subtitle/store';
import { VideoStore } from '@/video/store';
import { NavigationStore } from '@/navigation/store';
import { FileStore } from '@/file/store';
import { SelectStore } from '@/select/store';
import { AppearanceStore } from '@/appearance/store';

type StoreKey = 'appStore' | 'subtitleStore' | 'videoStore' | 'navigationStore' | 'fileStore' | 'selectStore' | 'appearanceStore';
type ReturnType<T extends StoreKey> = T extends 'appStore'
  ? AppStore
  : T extends 'subtitleStore'
  ? SubtitleStore
  : T extends 'videoStore'
  ? VideoStore
  : T extends 'navigationStore'
  ? NavigationStore
  : T extends 'fileStore'
  ? FileStore
  : T extends 'selectStore'
  ? SelectStore
  : T extends 'appearanceStore'
  ? AppearanceStore
  : unknown;

export const useInjectStore = <T extends StoreKey>(storeKey: T): ReturnType<T> => {
  const store = inject<ReturnType<T>>(storeKey);
  if (!store) {
    throw new Error(`inject failed: ${storeKey}`);
  }
  return store;
};
