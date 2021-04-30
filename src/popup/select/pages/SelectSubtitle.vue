<template>
  <PageLayout :content-transition-name='contentTransitionName' :has-back='videoCount > 1' :back-fn='backFn'>
    <template #content>
      <div v-if='loading'>
      </div>
      <div v-else-if='isYoutube && entries.length > 0'>
        <div v-for='(entry, index) in entries' :key='index'
             class='hover:cursor-pointer hover:bg-primary-700 hover:text-on-primary-700 py-2 px-2'
             @click='selectSubtitle(entry.path)'>
          <h3 class="text-lg py-2">{{ entry.language }}</h3>
          <div class="px-2">{{ entry.name }}</div>
        </div>
      </div>
      <div v-else-if='isYoutube && entries.length === 0' class="flex justify-center items-center	h-full">
        <span>Sorry, no subtitles found for the video.</span>
      </div>
      <div v-else class="flex justify-center items-center	h-full">
        <span>Sorry, currently only youtube is supported.</span>
      </div>
    </template>
  </PageLayout>
</template>

<script lang='ts'>

import { computed, defineComponent, onMounted, PropType, ref } from 'vue';
import PageLayout from '@/components/PageLayout.vue';
import { useInjectStore } from '@/composables/useInjectStore';

interface Entry {
  provider: string;
  id: string;
  language: string;
  name: string;
  path: string;
}

export default defineComponent({
  components: {
    PageLayout
  },
  props: {
    contentTransitionName: {
      type: String as PropType<string>,
      required: false,
      default: ''
    }
  },
  setup() {
    const navigationStore = useInjectStore('navigationStore');
    const videoStore = useInjectStore('videoStore');
    const selectStore = useInjectStore('selectStore');
    const appStore = useInjectStore('appStore');
    const subtitleStore = useInjectStore('subtitleStore');

    const url = new URL(window.location.href);
    const entries = ref<Entry[]>([]);
    const loading = ref<boolean>(true);

    const prefix = url.hostname === 'www.youtube.com' ? 'yt' : '<unknown>';
    const videoId = url.searchParams.get('v') ?? '';

    onMounted(async () => {
      const list = await selectStore.actions.list();
      entries.value = list
        .filter(e => e.startsWith(`${prefix}/${videoId}`))
        .map(path => {
          const [provider, id, language, name] = path.split('/');
          return {
            provider,
            id,
            language,
            name,
            path
          };
        });
      loading.value = false;
    });

    return {
      loading,
      videoCount: videoStore.getters.count,
      toSettings: navigationStore.actions.toSettings,
      entries,
      isYoutube: computed(() => prefix === 'yt'),
      selectSubtitle: async (entry) => {
        appStore.actions.setState({ state: 'SELECTED' });
        appStore.actions.setSrc({ src: 'SEARCH' });
        selectStore.actions.download(entry).then((raw) => {
          subtitleStore.actions.setRaw({
            raw,
            format: '.srt',
            id: entry,
            language: 'en'
          });
          subtitleStore.actions.parse();
        });
        navigationStore.actions.toHome({ contentTransitionName: 'content-navigate-select-to-home' });
      },
      backFn: (): void => {
        videoStore.actions.removeCurrent();
        navigationStore.actions.toHome();
      }
    };
  }
});
</script>