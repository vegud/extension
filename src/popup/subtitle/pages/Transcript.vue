<template>
  <PageLayout :content-transition-name="contentTransitionName" has-back>
    <template #toolbar>
      <a class="self-center pr-4" :title="infoTooltip">
        <FontAwesomeIcon icon="question-circle" class="h-icon hover:text-on-primary-hover-500"></FontAwesomeIcon>
      </a>
    </template>
    <template #content>
      <div class="w-full h-full grid relative justify-center transcript-content--container">
        <div style="grid-area: bar" class="pt-3 pb-2 bg-primary-50 flex justify-end">
          <span class="px-4 font-medium">{{ currentTimePretty }}</span>
        </div>
        <div style="grid-area: loading" class="flex items-end flex-wrap bg-primary-50 shadow-md">
          <LoadingBar class="w-full" />
        </div>
        <TranscriptContent style="grid-area: entries"></TranscriptContent>
      </div>
    </template>
  </PageLayout>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue';
import Duration from 'luxon/src/duration.js';

import PageLayout from '@/foundation/components/PageLayout.vue';
import LoadingBar from '@/foundation/components/LoadingBar.vue';
import FontAwesomeIcon from '@/foundation/components/FontAwesomeIcon/FontAwesomeIcon.vue';
import TranscriptContent from '@/subtitle/components/TranscriptContent.vue';
import { useInjectStore } from '@/useInjectStore';

export default defineComponent({
  components: {
    PageLayout,
    LoadingBar,
    TranscriptContent,
    FontAwesomeIcon
  },
  props: {
    contentTransitionName: {
      type: String as PropType<string>,
      required: false,
      default: ''
    }
  },
  setup() {
    const videoStore = useInjectStore('videoStore');
    const currentTime = ref<number>(0);

    videoStore.actions.useTimeUpdate(({ time }): void => {
      currentTime.value = time;
    });

    return {
      currentTimePretty: computed(() => Duration.fromMillis(currentTime.value * 1000).toFormat('mm:ss')),
      infoTooltip: computed(() => [`left click - jump to time point`, `shift + left click - copy text to clipboard`].join('\n'))
    };
  }
});
</script>

<style scoped>
.transcript-content--container {
  min-height: 300px;
  max-height: 500px;
  grid-template-areas:
    'bar'
    'loading'
    'entries';
  grid-template-rows: auto 8px 1fr;
  grid-template-columns: 1fr;
}
</style>
