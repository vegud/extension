<template>
  <div class="w-full h-full grid relative justify-center detect-subtitle-content--container">
    <div style="grid-area: language" class="pt-3">
      <div class="pl-3 text-lg font-bold">Choose the language of subtitles</div>
      <LanguageSelect :selected="language" @update:selected="$emit('update:language', $event)" v-model:show="showLanguageSelection"></LanguageSelect>
    </div>
    <div v-if="matchingSubtitle" style="grid-area: matching" class="pt-3 pb-2 mt-5">
      <div class="italic pr-2 w-full text-center">We found a matching subtitle!</div>
      <div class="flex justify-center items-center bg-primary-500 hover:bg-primary-700 text-on-primary-500 hover:text-on-primary-700 rounded-full py-2 px-4 mr-2 cursor-pointer mt-4" @click="$emit('select', {entry: matchingSubtitle?.path})">
        Click here to add subtitle ({{ matchingSubtitle?.name }})
      </div>
    </div>
    <div v-else class="flex justify-center items-center h-full">
      <div class="italic pr-2 w-full text-center">Sorry, we didn't found a matching subtitle :'(</div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue';
import LanguageSelect from '@/components/LanguageSelect.vue';
import { Entry, Language } from '@/selectSubtitle/pages/selectSubtitleTypes';
import {groupBy, episodeComparator} from './fn';

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
    const isYoutube = computed(() => prefix === 'yt');

    const entriesInCurrentLanguage = computed(() => props.entries.filter((e) => e.language?.toLowerCase() === props.language.iso639_2));

    const entriesInCurrentLanguageGroupByName = computed(() =>
      groupBy<Entry>({
        arr: entriesInCurrentLanguage.value,
        key: 'name',
        groupComparator: episodeComparator
      })
    );
    return {
      showLanguageSelection: ref(false),
      entriesInCurrentLanguage,
      entriesInCurrentLanguageGroupByName,
      entriesInCurrentLanguageUniqueName: computed(() => [...entriesInCurrentLanguageGroupByName.value.values()].reduce((acc, [entry]) => [...acc, entry], [])),
      matchingSubtitle: computed(() => isYoutube.value && entriesInCurrentLanguage.value.find((e) => e.id && e.id === url.searchParams.get('v')))
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