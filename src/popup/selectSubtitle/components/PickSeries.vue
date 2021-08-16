<template>
  <div class="w-full h-full grid relative justify-center pick-subtitle-content--container bg-primary-100">
    <div style="grid-area: language" class="pt-3">
      <div class="pl-3 text-lg font-bold">Choose the language of subtitles</div>
      <LanguageSelect :selected="language" @update:selected="$emit('update:language', $event)" v-model:show="showLanguageSelection"></LanguageSelect>
    </div>

    <div style="grid-area: title" class="pt-3">
      <div class="pl-3 text-lg font-bold">Choose which Title</div>
      <TitleSelect v-model:selected="entriesInCurrentLanguageUniqueName[0]" :entries="entriesInCurrentLanguageUniqueName" v-model:show="showTitleSelection"></TitleSelect>
    </div>

    <div style="grid-area: episode" class="pt-3">
      <div class="pl-3 text-lg font-bold">Choose which Episode</div>
      <EpisodeSelect v-model:selected="episode" :count="100" v-model:show="showEpisodeSelection"></EpisodeSelect>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, PropType, ref, watch } from 'vue';
import LanguageSelect from '@/components/LanguageSelect.vue';
import TitleSelect from '@/selectSubtitle/components/TitleSelect.vue';
import EpisodeSelect from '@/selectSubtitle/components/EpisodeSelect.vue';
import { Entry, Language } from '@/selectSubtitle/pages/selectSubtitleTypes';

const sort = (arr, comp) => [...arr].sort(comp);

export default defineComponent({
  components: {
    EpisodeSelect,
    TitleSelect,
    LanguageSelect,
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
  emits: ['update:language'],
  setup(props) {
    const showLanguageSelection = ref(false);
    const showTitleSelection = ref(false);
    const showEpisodeSelection = ref(false);

    const entriesInCurrentLanguage = computed(() => props.entries.filter((e) => e.language?.toLowerCase() === props.language.iso639_2));

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

    return {
      showLanguageSelection,

      entriesInCurrentLanguage,
      entriesInCurrentLanguageGroupByName,
      entriesInCurrentLanguageUniqueName,

      showTitleSelection,
      showEpisodeSelection,
      episode: ref(0),
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
    'episode';
  grid-template-rows: auto auto auto;
  grid-template-columns: 1fr;
}
</style>