<template>
  <div class="w-full h-full grid relative justify-center pick-subtitle-content--container">
    <div style="grid-area: language" class="pt-3">
      <div class="pl-3 text-lg font-bold">Choose the language of subtitles</div>
      <LanguageSelect :selected="language" :filter-list="['ar', 'fr', 'en', 'fr', 'de', 'de', 'es', 'it']" @update:selected="$emit('update:language', $event)" v-model:show="showLanguageSelection"></LanguageSelect>
    </div>

    <div style="grid-area: title" class="pt-3">
      <div class="pl-3 text-lg font-bold">Choose which Title</div>
      <TitleSelect v-model:selected="entry" :entries="entriesInCurrentLanguageUniqueName" v-model:show="showTitleSelection"></TitleSelect>
    </div>

    <div style="grid-area: episode" class="pt-3">
      <div class="pl-3 text-lg font-bold">Choose which Episode</div>
      <EpisodeSelect v-model:selected="episode" :count="episodeCount" :labels="episodeLabels" v-model:show="showEpisodeSelection"></EpisodeSelect>
    </div>

    <div class="flex justify-end my-2" style="grid-area: go">
      <div class="flex justify-center items-center bg-primary-500 hover:bg-primary-700 text-on-primary-500 hover:text-on-primary-700 rounded-full py-2 px-4 mr-2 cursor-pointer" @click="go">
        Go to video
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, PropType, ref, watch } from 'vue';
import LanguageSelect from '@/components/LanguageSelect/LanguageSelect.vue';
import TitleSelect from '@@/selectSubtitle/components/TitleSelect.vue';
import EpisodeSelect from '@@/selectSubtitle/components/EpisodeSelect.vue';
import { Entry, Language } from '@@/selectSubtitle/pages/selectSubtitleTypes';
import { groupBy, episodeComparator } from './fn';
import { set as storageSet } from 'storage';

export default defineComponent({
  components: {
    EpisodeSelect,
    TitleSelect,
    LanguageSelect
  },
  props: {
    contentTransitionName: {
      type: String as PropType<string>,
      required: false,
      default: ''
    },
    entries: {
      type: Array as PropType<Entry[]>,
      default: []
    },
    language: {
      type: Object as PropType<Language>,
      required: true
    }
  },
  emits: ['update:language', 'select'],
  setup(props, { emit }) {
    const showLanguageSelection = ref(false);
    const showTitleSelection = ref(false);
    const showEpisodeSelection = ref(false);

    const entriesInCurrentLanguage = computed(() => props.entries.filter((e) => e.language?.toLowerCase() === props.language.iso639_2));

    const entriesInCurrentLanguageGroupByName = computed(() =>
      groupBy<Entry>({
        arr: entriesInCurrentLanguage.value,
        key: 'name',
        groupComparator: episodeComparator
      })
    );

    const setSetShowSelection = (apply: boolean, { language, title, episode }: { language: boolean; title: boolean; episode: boolean }) => {
      if (!apply) {
        return;
      }
      showLanguageSelection.value = language;
      showTitleSelection.value = title;
      showEpisodeSelection.value = episode;
    };

    watch(showLanguageSelection, (show) => setSetShowSelection(show, { language: show, title: false, episode: false }));
    watch(showTitleSelection, (show) => setSetShowSelection(show, { language: false, title: show, episode: false }));
    watch(showEpisodeSelection, (show) => setSetShowSelection(show, { language: false, title: false, episode: show }));

    const entriesInCurrentLanguageUniqueName = computed(() => [...entriesInCurrentLanguageGroupByName.value.values()].reduce((acc, [entry]) => [...acc, entry], []));
    const entry = ref(entriesInCurrentLanguageUniqueName.value[0]);
    watch(entriesInCurrentLanguageUniqueName, () => entry.value = entriesInCurrentLanguageUniqueName.value[0]);

    const episode = ref(1);

    return {
      showLanguageSelection,

      entriesInCurrentLanguage,
      entriesInCurrentLanguageGroupByName,
      entriesInCurrentLanguageUniqueName,

      showTitleSelection,

      showEpisodeSelection,
      episode,
      episodeCount: computed(() => entriesInCurrentLanguageGroupByName.value.get(entry.value?.name)?.length ?? 0),
      episodeLabels: computed(() => entriesInCurrentLanguageGroupByName.value.get(entry.value?.name)?.map((e) => e.episode) ?? []),

      entry,
      go: () => {
        const founded = entriesInCurrentLanguageGroupByName.value.get(entry.value.name)?.find((e) => e.episode === episode.value.toString());
        if (!founded) {
          return;
        }

        emit('select', {
          entry: founded.path,
          afterDownloadFn: async () => {
            await storageSet({ redirected: founded });
            const url = new URL(window.location.href);
            const isYoutube = url.hostname === 'www.youtube.com';
            const isSameV = url.searchParams.get('v') === founded.id;
            if (isYoutube && isSameV) {
              return;
            }
            window.location.href = `https://www.youtube.com/watch?v=${founded.id}`;
          }
        });
      }
    };
  }
});
</script>

<style scoped>
.pick-subtitle-content--container {
  min-height: 300px;
  max-height: 500px;
  grid-template-areas:
    'language'
    'title'
    'episode'
    'go';
  grid-template-rows: auto auto auto auto;
  grid-template-columns: 1fr;
}
</style>