<template>
  <PageLayout :content-transition-name="contentTransitionName" :has-back="videoCount > 1" :back-fn="backFn">
    <template #toolbar>
      <a class="self-center pr-4" @click="toSettings()">
        <fa icon="cog" class="h-icon hover:text-on-primary-hover-500"></fa>
      </a>
    </template>
    <template #content>
      <div class="w-full h-full grid relative justify-center search-content--container">
        <div style="grid-area: search-bar" class="pt-3 pb-2 bg-primary-100">
          <LanguageSelect v-model:selected="language" v-model:show="showLanguageSelection"></LanguageSelect>

          <div class="w-full mt-2">
            <InputField v-model="filter" placeholder="Filter subtitles" placeholder-icon="filter" class="px-2" />
          </div>
          <div v-show="entries.length > 0" class="px-5 mt-2 leading-normal text-sm flex">
            <div class="italic pr-2">Suggestion</div>
            <a class="relative text-primary-700 hover:underline italic">{{ entries[0]?.name }}</a>
          </div>
        </div>
        <div style="grid-area: loading" class="flex items-end flex-wrap bg-primary-50 shadow-md">
          <LoadingBar :loading="loading" class="w-full" />
        </div>

        <div v-if="entries.length" class="overflow-y-auto" style="grid-area: search-results">
          <div v-for="(entry, index) in entries" :key="index">
            <Divider v-if="index === 0" style="grid-column: 1/3" class="border-surface-200" />
            <!--            <h3 class="text-lg py-2">{{ entry.language }}</h3>-->
            <!--            <div class="px-2">{{ entry.name }}</div>-->
            <h3 class="text-lg py-2 px-2 hover:bg-primary-200">{{ entry }}</h3>
            <Divider style="grid-column: 1/3" class="border-surface-200" />
          </div>
        </div>
        <div v-else-if="isYoutube && entries.length === 0" class="flex justify-center items-center h-full">
          <span>{{ entries }}</span>
        </div>
        <div v-else class="flex justify-center items-center h-full">
          <span>Sorry, currently only youtube is supported.</span>
        </div>
      </div>
      <!--      <div v-if='loading'>-->
      <!--      </div>-->
      <!--      <div v-else-if='isYoutube && entries.length > 0'>-->
      <!--        <div v-for='(entry, index) in entries' :key='index'-->
      <!--             class='hover:cursor-pointer hover:bg-primary-700 hover:text-on-primary-700 py-2 px-2'-->
      <!--             @click='selectSubtitle(entry.path)'>-->
      <!--          <h3 class="text-lg py-2">{{ entry.language }}</h3>-->
      <!--          <div class="px-2">{{ entry.name }}</div>-->
      <!--        </div>-->
      <!--      </div>-->
      <!--      <div v-else-if='isYoutube && entries.length === 0' class="flex justify-center items-center	h-full">-->
      <!--        <span>Sorry, no subtitles found for the video.</span>-->
      <!--      </div>-->
      <!--      <div v-else class="flex justify-center items-center	h-full">-->
      <!--        <span>Sorry, currently only youtube is supported.</span>-->
      <!--      </div>-->
    </template>
  </PageLayout>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, PropType, ref } from 'vue';
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

    const url = new URL(window.location.href);
    const entries = ref<Entry[]>([]);
    const loading = ref<boolean>(true);

    const prefix = url.hostname === 'www.youtube.com' ? 'yt' : '<unknown>';
    console.warn(prefix);
    const videoId = url.searchParams.get('v') ?? '';

    onMounted(async () => {
      const list = await selectStore.actions.list();
      console.warn('list');
      console.warn(list);
      entries.value = list
        // .filter((e) => e.startsWith(`${prefix}/${videoId}`))
        .map((path) => {
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
      toSettings: navigationStore.actions.toSettings,
      videoCount: videoStore.getters.count,
      entries,
      showLanguageSelection: ref(false),
      language: ref({
        iso639_2: 'de',
        iso639Name: 'German'
      }),
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