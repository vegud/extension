import { computed, ComputedRef, onUnmounted, Ref, ref, watch } from 'vue';
import { SubtitleEntry } from '@/subtitle/store';
import { ContentScriptStore, MessageEventFromContentScript } from '@/contentScript/store';
import {filter, first, mergeMap, share, shareReplay, takeUntil, tap} from 'rxjs/operators';
import {combineLatest, from, merge, Subject} from 'rxjs';
import { nanoid } from 'nanoid';

interface InitPayload {
  use: {
    contentScriptStore: ContentScriptStore;
  };
}

export interface Video {
  id: string;
  hasSubtitle: boolean;
  origin: string;
}

type CurrentSelectedVideoState = Video | null;

declare global {
  interface Window {
    plusSub_currentSelectedVideo: Ref<CurrentSelectedVideoState>;
    plusSub_videos: Ref<Record<string, Video>>;
  }
}

export interface VideoStore {
  actions: {
    setCurrent: (payload: { video: Pick<Video, 'id'> }) => void;
    removeCurrent: () => void;
    addVtt: (payload: { subtitles: SubtitleEntry[]; subtitleId: string; language: string }) => void;
    removeVtt: () => void;
    setTime: (payload: { time: number }) => void;
    useTimeUpdate: (fn: (payload: { time: number }) => void) => void;
    highlight: (payload: { video: Pick<Video, 'id'> | null }) => void;
    removeHighlight: () => void;
  };
  getters: {
    current: ComputedRef<Video | null>;
    list: ComputedRef<Video[]>;
    count: ComputedRef<number>;
  };
}

export const init = ({ use }: InitPayload): VideoStore => {
  window.plusSub_currentSelectedVideo = window.plusSub_currentSelectedVideo ? ref(window.plusSub_currentSelectedVideo.value) : ref<CurrentSelectedVideoState>(null);
  window.plusSub_videos = window.plusSub_videos ? ref(window.plusSub_videos.value) : ref<Record<string, Video>>({});

  type FindVideosResultMessageEvent = MessageEventFromContentScript<'FIND_VIDEOS_RESULT'> & { data: { videos: Record<string, { id: string; hasSubtitle: boolean; origin: string }>; origin: string } };

  const findVideoResultObservable = use.contentScriptStore.state.messageObservable.pipe(
    filter<MessageEventFromContentScript<string>, FindVideosResultMessageEvent>((e): e is FindVideosResultMessageEvent => e.data.plusSubActionFromContentScript === 'FIND_VIDEOS_RESULT'),
    tap((e) => {
      window.plusSub_videos.value = {
        ...Object.fromEntries(Object.entries(window.plusSub_videos.value).filter(([, { origin }]) => origin !== e.data.origin)),
        ...e.data.videos
      };

      const currentSelected = window.plusSub_currentSelectedVideo.value;
      if (currentSelected && currentSelected.origin === e.data.origin) {
        const currentFromContentScript = e.data.videos[currentSelected.id];
        if (!currentFromContentScript || (currentSelected.hasSubtitle && !currentFromContentScript.hasSubtitle)) {
          console.warn('currentSelected removed');
          window.plusSub_currentSelectedVideo.value = null;
        }
      }
    })
  );

  const timeSubject = new Subject<number>();
  type TimeUpdateMessageEvent = MessageEventFromContentScript<'TIME_UPDATE'> & { data: { time: number } };
  const timeUpdateObservable = use.contentScriptStore.state.messageObservable.pipe(
    filter<MessageEventFromContentScript<string>, TimeUpdateMessageEvent>((e): e is TimeUpdateMessageEvent => e.data.plusSubActionFromContentScript === 'TIME_UPDATE'),
    tap((e) => timeSubject.next(e.data.time))
  );

  const iFrameConnectionObservable = use.contentScriptStore.state.connectionObservable.pipe(
    mergeMap((e) => from(Object.values(e).map(e => e.origin))),
    tap((origin) => use.contentScriptStore.actions.sendCommand(origin, { plusSubActionFromPopup: 'FIND_VIDEOS' }))
  );

  const unmountSubject = new Subject<undefined>();
  merge(findVideoResultObservable, timeUpdateObservable, iFrameConnectionObservable).pipe(takeUntil(unmountSubject)).subscribe();
  onUnmounted(() => unmountSubject.next(undefined));

  const removeVtt = ({ id, origin }: Pick<Video, 'id' | 'origin'>) => {
    use.contentScriptStore.actions.sendCommand(origin, {
      plusSubActionFromPopup: 'REMOVE_SUBTITLE',
      video: {
        id
      }
    });
  };

  watch(
    () => window.plusSub_currentSelectedVideo.value,
    (current, prev) => {
      if (current === null && prev !== null) {
        removeVtt(prev);
      }
    }
  );

  return {
    actions: {
      setCurrent: ({ video: { id } }: { video: Pick<Video, 'id'> }) => {
        window.plusSub_currentSelectedVideo.value = window.plusSub_videos.value[id] ?? null;
      },
      removeCurrent: () => {
        window.plusSub_currentSelectedVideo.value = null;
      },
      addVtt: ({ subtitles, subtitleId, language }: { subtitles: SubtitleEntry[]; subtitleId: string; language: string }): void => {
        const video = window.plusSub_currentSelectedVideo.value;
        if (!video) {
          return;
        }
        use.contentScriptStore.actions.sendCommand(video.origin, {
          plusSubActionFromPopup: 'ADD_SUBTITLE',
          video: {
            id: video.id
          },
          subtitle: {
            id: subtitleId,
            entries: JSON.parse(JSON.stringify(subtitles)),
            language
          }
        });
      },
      removeVtt: (): void => {
        const video = window.plusSub_currentSelectedVideo.value;
        if (!video) {
          return;
        }
        removeVtt(video);
      },
      setTime: ({ time }: { time: number }): void => {
        const video = window.plusSub_currentSelectedVideo.value;
        if (!video) {
          console.warn('setTime: current video not found');
          return;
        }
        use.contentScriptStore.actions.sendCommand(window.plusSub_videos.value[video.id].origin, {
          plusSubActionFromPopup: 'SET_TIME',
          id: video.id,
          time
        });
      },

      useTimeUpdate: (fn: (payload: { time: number }) => void) => {
        const video = window.plusSub_currentSelectedVideo.value;
        if (!video) {
          console.warn('useTimeUpdate: current video not found');
          return;
        }
        const origin = video.origin;
        const videoId = video.id;
        const subscriptionId = nanoid(12);
        const unmountSubject = new Subject<undefined>();

        // workaround race condition if popup will be initialized
        setTimeout(() => {
          use.contentScriptStore.actions.sendCommand(origin, {
            plusSubActionFromPopup: 'SUBSCRIBE_TO_TIME_UPDATE',
            video: {
              id: videoId
            },
            subscription: {
              id: subscriptionId
            }
          });
        }, 200);

        timeSubject
          .pipe(
            tap((time) => fn({ time })),
            takeUntil(unmountSubject)
          )
          .subscribe();

        onUnmounted(() => {
          unmountSubject.next(undefined);
          use.contentScriptStore.actions.sendCommand(origin, {
            plusSubActionFromPopup: 'UNSUBSCRIBE_TO_TIME_UPDATE',
            subscription: {
              id: subscriptionId
            }
          });
        });
      },
      highlight: ({ video }: { video: Pick<Video, 'id'> | null }): void => {
        if (!video) {
          console.warn('highlight: video not found');
          return;
        }
        use.contentScriptStore.actions.sendCommand(window.plusSub_videos.value[video.id].origin, {
          plusSubActionFromPopup: 'HIGHLIGHT_VIDEO',
          id: video.id
        });
      },
      removeHighlight: () => {
        new Set(Object.values(window.plusSub_videos.value).map(({ origin }) => origin)).forEach((origin) => {
          use.contentScriptStore.actions.sendCommand(origin, { plusSubActionFromPopup: 'REMOVE_HIGHLIGHT_FROM_VIDEO' });
        });
      }
    },
    getters: {
      current: computed(() => window.plusSub_currentSelectedVideo.value),
      list: computed(() => Object.values(window.plusSub_videos.value)),
      count: computed(() => Object.keys(window.plusSub_videos.value).length)
    }
  };
};
