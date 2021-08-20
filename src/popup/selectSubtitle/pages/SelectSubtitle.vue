<template>
  <PageLayout :content-transition-name="contentTransitionName" :has-back="videoCount > 1" :back-fn="backFn">
    <template #toolbar>
      <a class="self-center pr-4" @click="signOut()">
        <fa icon="sign-out-alt" class="h-icon hover:text-on-primary-hover-500"></fa>
      </a>
    </template>
    <template #content>
      <div class="relative bg-surface-50 w-full grid rounded-lg shadow-lg border border-primary-700 m-2" style="width: calc(100% - 16px)">
        <div class="flex justify-around relative mt-1">
          <PrefixIconButton icon="search" icon-size="large" class="py-3" :class="{ 'border-b-2': tab === 'pick', 'text-primary-700': tab === 'pick'}" @click="tab = 'pick'">
            <template #label>
              <span>Pick</span>
            </template>
          </PrefixIconButton>

          <PrefixIconButton icon="magic" icon-size="large" class="py-3" :class="{ 'border-b-2': tab === 'detect', 'text-primary-700': tab === 'detect' }" @click="tab = 'detect'">
            <template #label>
              <span>Detect</span>
              <span v-if="isMatchingSubtitleInCurrentLanguage" class="flex h-3 w-3 absolute right-9 top-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-800 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-3 w-3 bg-primary-800"></span>
               </span>
            </template>
          </PrefixIconButton>
        </div>

        <div class="bg-primary-100 mx-2 h-px">
          <LoadingBar v-if="loading" :loading="loading" class="w-full" />
        </div>
        <div class="mx-9 mt-2">
          <PickSeries v-if="tab === 'pick'" :entries="entries" v-model:language="language" @select="selectSubtitle"></PickSeries>
          <DetectSubtitle v-else :entries="entries" v-model:language="language" @select="selectSubtitle"></DetectSubtitle>
        </div>
      </div>
    </template>
  </PageLayout>
</template>

<script lang="ts">
import PageLayout from '@/components/PageLayout.vue';
import { computed, defineComponent, onMounted, PropType, ref, watch } from 'vue';
import { useInjectStore } from '@/composables/useInjectStore';
import PickSeries from '@/selectSubtitle/components/PickSeries.vue';
import DetectSubtitle from '@/selectSubtitle/components/DetectSubtitle.vue';
import PrefixIconButton from '@/components/PrefixIconButton.vue';
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
    LoadingBar,
    PrefixIconButton
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
            const episode = splitByUnderscore[splitByUnderscore.length - 1]?.replace(/^0+/, '')
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

    const url = new URL(window.location.href);
    const prefix = url.hostname === 'www.youtube.com' ? 'yt' : '<unknown>';
    const isYoutube = computed(() => prefix === 'yt');

    return {
      videoCount: videoStore.getters.count,
      loading,
      tab: ref('pick'),
      signOut: loginStore.actions.signOut,
      entries,
      isMatchingSubtitleInCurrentLanguage: computed(() => isYoutube.value && entries.value
        .find((e) => e.id && e.id === url.searchParams.get('v') && e.language === language.value.iso639_2)
      ),
      language,
      backFn: (): void => {
        videoStore.actions.removeCurrent();
        navigationStore.actions.toHome();
      },
      selectSubtitle: async ({entry, afterDownloadFn}) => {
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
        }).then(() => afterDownloadFn ? afterDownloadFn() : null);
        navigationStore.actions.toHome({ contentTransitionName: 'content-navigate-select-to-home' });
      }
    };
  }
});
</script>