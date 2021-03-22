<template>
  <PageLayout :content-transition-name='contentTransitionName' :has-back='videoCount > 1' :back-fn='backFn'>
    <template #content>
      <div v-for='(entry, index) in filtered' :key='index'
           class='hover:cursor-pointer hover:bg-primary-700 hover:text-on-primary-700'
           @click="selectSubtitle(entry)" >
        {{ entry }}
      </div>
    </template>
  </PageLayout>
</template>

<script lang='ts'>

import { defineComponent, onMounted, PropType, ref } from 'vue';
import PageLayout from '@/components/PageLayout.vue';
import { useInjectStore } from '@/composables/useInjectStore';

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
    const filtered = ref<string[]>([]);

    const prefix = url.hostname === 'www.youtube.com' ? 'yt' : '<unknown>';
    const videoId = url.searchParams.get('v') ?? '';

    onMounted(async () => {
      const list = await selectStore.actions.list();
      filtered.value = list.filter(e => e.startsWith(`${prefix}/${videoId}`));
    });

    return {
      videoCount: videoStore.getters.count,
      toSettings: navigationStore.actions.toSettings,
      filtered,
      selectSubtitle: async (entry) => {
        appStore.actions.setState({ state: 'SELECTED' });
        appStore.actions.setSrc({ src: 'SEARCH' });
        selectStore.actions.download(entry).then((raw) => {
          console.warn(raw);
          subtitleStore.actions.setRaw({
            raw,
            format: '.srt',
            id: entry,
            language: "en"
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