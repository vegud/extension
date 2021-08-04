<template>
  <PageLayout :content-transition-name="contentTransitionName" :has-back="videoCount > 1" :back-fn="backFn">
    <template #toolbar>
      <a class="self-center pr-4" @click="signOut()">
        <fa icon="sign-out-alt" class="h-icon hover:text-on-primary-hover-500"></fa>
      </a>
    </template>
    <template #content>
      <div class="w-full h-full grid relative justify-center search-content--container">
        <div style="grid-area: search-bar" class="pt-3 pb-2 bg-primary-100">
          <LanguageSelect v-model:selected="language" v-model:show="showLanguageSelection"></LanguageSelect>

          <div class="w-full mt-2">
            <InputField v-model="filter" placeholder="Filter subtitles" placeholder-icon="filter" class="px-2" />
          </div>
          <div v-show="matchingSubtitle" class="px-5 mt-2 leading-normal text-sm flex">
            <div class="italic pr-2">Matching subtitle</div>
            <a class="relative text-primary-700 hover:underline italic" @click="selectSubtitle(matchingSubtitle?.path)">{{ matchingSubtitle?.name }}</a>
          </div>
        </div>
        <div style="grid-area: loading" class="flex items-end flex-wrap bg-primary-50 shadow-md">
          <LoadingBar :loading="loading" class="w-full" />
        </div>

        <div v-if="entriesInCurrentLanguageUniqueName.length" class="overflow-y-auto" style="grid-area: search-results">
          <div v-for="(entry, index) in entriesInCurrentLanguageUniqueName" :key="index">
            <Divider v-if="index === 0" style="grid-column: 1/3" class="border-surface-200" />
            <h3 class="text-lg py-2 px-2">{{ entry.name }}</h3>
            <details v-if="entriesInCurrentLanguageGroupByName.get(entry.name).length > 1" class="py-2 px-4">
              <summary class="cursor-pointer hover:text-primary-700">Episodes</summary>
              <div
                v-for="(episodeEntry, index) in entriesInCurrentLanguageGroupByName.get(entry.name)"
                :key="index"
                class="hover:bg-primary-200 px-6 py-2 cursor-pointer"
                :class="{ 'pt-3': index === 0 }"
                @click="selectSubtitle(episodeEntry.path)"
              >
                Episode {{ episodeEntry.episode }}
              </div>
            </details>
            <Divider style="grid-column: 1/3" class="border-surface-200" />
          </div>
        </div>
        <div v-else-if="isYoutube && entriesInCurrentLanguage.length === 0 && !loading" class="flex justify-center items-center h-full">
          <span>Sorry, no subtitles found in this language.</span>
        </div>
        <div v-else class="flex justify-center items-center h-full"></div>
      </div>
    </template>
  </PageLayout>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, PropType, ref, watch } from 'vue';
import PageLayout from '@/components/PageLayout.vue';
import LanguageSelect from '@/components/LanguageSelect.vue';
import Divider from '@/components/Divider.vue';
import LoadingBar from '@/components/LoadingBar.vue';
import InputField from '@/components/InputField.vue';
import { useInjectStore } from '@/composables/useInjectStore';

interface Entry {
  provider: string;
  id: string;
  language: string;
  name: string;
  path: string;
}

const sort = (arr, comp) => [...arr].sort(comp);

export default defineComponent({
  components: {
    PageLayout,
    LanguageSelect,
    Divider,
    LoadingBar,
    InputField
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
    const loginStore = useInjectStore('loginStore');

    const url = new URL(window.location.href);
    const entries = ref<Entry[]>([]);
    const loading = ref<boolean>(true);

    const prefix = url.hostname === 'www.youtube.com' ? 'yt' : '<unknown>';

    onMounted(async () => {
      const list = await selectStore.actions.list();
      entries.value = sort(
        list
          .filter((e) => e.startsWith(`${prefix}/`))
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

    const language = ref({
      iso639_2: 'fr',
      iso639Name: 'French'
    });

    const entriesInCurrentLanguage = computed(() => entries.value.filter((e) => e.language?.toLowerCase() === language.value.iso639_2));
    const isYoutube = computed(() => prefix === 'yt');

    const entriesInCurrentLanguageGroupByName = computed(() =>
      entriesInCurrentLanguage.value.reduce(
        (map, entry) =>
          map.set(
            entry.name,
            sort([...(map.get(entry.name) ?? []), entry], (a, b) => a.episode.localeCompare(b.episode))
          ),
        new Map()
      )
    );

    const entriesInCurrentLanguageUniqueName = computed(() => [...entriesInCurrentLanguageGroupByName.value.values()].reduce((acc, cur) => [...acc, cur[0]], []));

    return {
      loading,
      signOut: loginStore.actions.signOut,
      videoCount: videoStore.getters.count,
      entries,

      showLanguageSelection: ref(false),
      language,
      entriesInCurrentLanguage,
      entriesInCurrentLanguageGroupByName,
      entriesInCurrentLanguageUniqueName,
      matchingSubtitle: computed(() => entriesInCurrentLanguage.value.find((e) => isYoutube.value && e.id && e.id === url.searchParams.get('v'))),

      isYoutube,
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

<style scoped>
.search-content--container {
  min-height: 300px;
  max-height: 500px;
  grid-template-areas:
    'search-bar'
    'loading'
    'search-results';
  grid-template-rows: auto 8px 1fr;
  grid-template-columns: 1fr;
}
</style>