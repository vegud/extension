<template>
  <PageLayout :content-transition-name="contentTransitionName" :has-back="videoCount > 1" :back-fn="backFn">
    <template #toolbar>
      <a class="self-center pr-4" @click="signOut()">
        <fa icon="sign-out-alt" class="h-icon hover:text-on-primary-hover-500"></fa>
      </a>
    </template>
    <template #content>
      <div class="flex mt-2 mx-2 gap-1">
        <div class="rounded-t-lg w-full cursor-pointer text-center h-8" :class="{ 'bg-primary-400': tab === 'pick', 'bg-primary-200': tab !== 'pick' }" @click="tab = 'pick'">
          <div class="mt-2" :class="{ 'text-on-primary-400': tab === 'pick', 'text-on-primary-200': tab !== 'pick' }">Pick</div>
        </div>
        <div class="rounded-t-lg w-full cursor-pointer text-center h-8 relative" :class="{ 'bg-primary-400': tab === 'select', 'bg-primary-200': tab !== 'select' }" @click="tab = 'select'">
          <div class="mt-2" :class="{ 'text-on-primary-400': tab === 'select', 'text-on-primary-200': tab !== 'select' }">Detect</div>
          <span class="flex h-3 w-3 absolute right-1.5 top-1.5">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-800 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-3 w-3 bg-primary-800"></span>
          </span>
        </div>
      </div>

      <div class="bg-primary-100 mx-2 h-px">
        <LoadingBar v-if="loading" :loading="loading" class="w-full" />
      </div>

      <div v-if="tab === 'pick'" class="mx-2">
        <PickSeries :entries="entries" v-model:language="language" @select="selectSubtitle"></PickSeries>
      </div>
      <div v-else class="mx-2">
        <DetectSubtitle :entries="entries" v-model:language="language" @select="selectSubtitle"></DetectSubtitle>
      </div>
    </template>
  </PageLayout>
</template>

<script lang="ts">
import PageLayout from '@/components/PageLayout.vue';
import { defineComponent, onMounted, PropType, ref, watch } from 'vue';
import { useInjectStore } from '@/composables/useInjectStore';
import PickSeries from '@/selectSubtitle/components/PickSeries.vue';
import DetectSubtitle from '@/selectSubtitle/components/DetectSubtitle.vue';
import { get as storageGet, set as storageSet } from 'storage';
import LoadingBar from '@/components/LoadingBar.vue';
import { Entry } from '@/selectSubtitle/pages/selectSubtitleTypes';

const sort = (arr, comp) => [...arr].sort(comp);
const storageGetOrDefault = async (key, defaultValue) => {
  const value = await storageGet([key]);
  if (!value || !Object.keys(value).length) {
    return {
      [key]: defaultValue
    };
  }
  return value;
};

export default defineComponent({
  components: {
    DetectSubtitle,
    PickSeries,
    PageLayout,
    LoadingBar
  },
  props: {
    contentTransitionName: {
      type: String as PropType<string>,
      required: false,
      default: ''
    }
  },
  setup() {
    const appStore = useInjectStore('appStore');
    const videoStore = useInjectStore('videoStore');
    const navigationStore = useInjectStore('navigationStore');
    const loginStore = useInjectStore('loginStore');
    const selectSubtitleStore = useInjectStore('selectSubtitleStore');
    const subtitleStore = useInjectStore('subtitleStore');

    const entries = ref<Entry[]>([]);
    const loading = ref<boolean>(true);
    const language = ref({
      iso639_2: 'fr',
      iso639Name: 'French'
    });
    watch(language, (selectLanguage) => storageSet({ selectLanguage }));

    onMounted(async () => {
      const list = await selectSubtitleStore.actions.list();
      const { selectLanguage } = await storageGetOrDefault('selectLanguage', language.value);
      language.value = selectLanguage;

      entries.value = sort(
        list
          .filter((e) => e.startsWith('yt/'))
          .map((path) => {
            const [provider, id, language, filename] = path.split('/');

            const splitByUnderscore = filename?.replace('.srt', '')?.split('_') ?? [];
            const episode = splitByUnderscore[splitByUnderscore.length - 1];
            const name = splitByUnderscore.slice(0, splitByUnderscore.length - 1).join(' ');
            return {
              provider,
              id,
              language: language?.toLowerCase(),
              filename,
              name,
              episode,
              path
            };
          })
          .filter((e) => e.name),
        (a, b) => a.name.localeCompare(b.name)
      );

      loading.value = false;
    });

    return {
      videoCount: videoStore.getters.count,
      loading,
      tab: ref('pick'),
      signOut: loginStore.actions.signOut,
      entries,
      language,
      backFn: (): void => {
        videoStore.actions.removeCurrent();
        navigationStore.actions.toHome();
      },
      selectSubtitle: async (entry) => {
        appStore.actions.setState({ state: 'SELECTED' });
        appStore.actions.setSrc({ src: 'SEARCH' });
        selectSubtitleStore.actions.download(entry).then((raw) => {
          subtitleStore.actions.setRaw({
            raw,
            format: '.srt',
            id: entry,
            language: 'en'
          });
          subtitleStore.actions.parse();
        });
        navigationStore.actions.toHome({ contentTransitionName: 'content-navigate-select-to-home' });
      }
    };
  }
});
</script>