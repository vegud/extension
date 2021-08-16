<template>
  <div class="w-full h-full grid relative justify-center detect-subtitle-content--container bg-primary-100">
    <div style="grid-area: language" class="pt-3">
      <div class="pl-3 text-lg font-bold">Choose the language of subtitles</div>
      <LanguageSelect :selected="language" @update:selected="$emit('update:language', $event)" v-model:show="showLanguageSelection"></LanguageSelect>
    </div>
    <div v-if="matchingSubtitle" style="grid-area: matching" class="pt-3 pb-2 mt-5">
      <div class="italic pr-2 w-full text-center">We found a matching subtitle!</div>
      <a class="block text-primary-700 hover:underline italic text-center w-full pt-4" @click="$emit('select', matchingSubtitle?.path)">{{">>"}} click here to add subtitle ({{ matchingSubtitle?.name }}) {{"<<"}}</a>
    </div>
    <div v-else class="flex justify-center items-center h-full">
      <div class="italic pr-2 w-full text-center">Sorry, we didn't found a matching subtitle :'(</div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, PropType, ref, watch } from 'vue';
import LanguageSelect from '@/components/LanguageSelect.vue';
import { Entry, Language } from '@/selectSubtitle/pages/selectSubtitleTypes';

const sort = (arr, comp) => [...arr].sort(comp);

export default defineComponent({
  components: {
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
  setup(props) {
    const url = new URL(window.location.href);
    const prefix = url.hostname === 'www.youtube.com' ? 'yt' : '<unknown>';

    const entriesInCurrentLanguage = computed(() => props.entries.filter((e) => e.language?.toLowerCase() === props.language.iso639_2));
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
      showLanguageSelection: ref(false),
      entriesInCurrentLanguage,
      entriesInCurrentLanguageGroupByName,
      entriesInCurrentLanguageUniqueName,
      matchingSubtitle: computed(() => entriesInCurrentLanguage.value.find((e) => isYoutube.value && e.id && e.id === url.searchParams.get('v')))
    };
  }
});
</script>

<style scoped>
.detect-subtitle-content--container {
  min-height: 300px;
  max-height: 500px;
  grid-template-areas:
    'language'
    'matching';
  grid-template-rows: auto 1fr;
  grid-template-columns: 1fr;
}
</style>
