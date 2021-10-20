<template>
  <PageLayout :content-transition-name="contentTransitionName">
    <template #toolbar>
      <Toolbar/>
    </template>
    <template #content>
      <div class="relative bg-surface-50 w-full grid rounded-lg shadow-lg border border-primary-700 m-2 tutorial-container gap-2" style="width: calc(100% - 16px)">
        <div class="flex mt-2 px-2 flex-wrap" style="grid-area: header">
          <div class="font-header font-medium text-2xl w-full text-center">Welcome to Vegud!</div>
          <div class="text-xs text-sub-text-on-surface-50 w-full text-center"> Smart Solution for Subtitle Integration</div>
        </div>

        <div class="px-4 leading-relaxed mt-4" style="grid-area: explainer">
          <div class="text-center">
            Vegud: Is the best extension to integrate subtitles in a wide range of Youtube Videos with
            different languages.
          </div>
          <div class="text-center mt-4">
            Please follow this tutorial to learn how the extension work.
          </div>
        </div>

        <div class="flex justify-center mt-2" style="grid-area: watch-btn">
          <div class="flex justify-center items-center bg-primary-500 hover:bg-primary-700 text-on-primary-500 hover:text-on-primary-700 rounded-full py-2 px-8 mr-2 cursor-pointer" @click="redirectToTutorial">
            Watch Tutorial
          </div>
        </div>

        <div class="flex justify-center mt-2" style="grid-area: skip-btn">
          <div class="flex justify-center items-center bg-primary-500 hover:bg-primary-700 text-on-primary-500 hover:text-on-primary-700 rounded-full py-2 px-10 mr-2 cursor-pointer" @click="skipTutorial">
            Skip Tutorial
          </div>
        </div>

        <div class="my-2 ml-4 flex" style="grid-area: do-not-show-again-btn">
          <input v-model="doNotShowAgain" type="checkbox" class="text-primary-700 focus:ring-0 focus:ring-offset-0 self-center" />
          <span class="ml-1 text-xs text-sub-text-on-surface-50">Do not show again, tutorial window</span>
        </div>

      </div>
    </template>
  </PageLayout>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';
import PageLayout from '@/components/PageLayout.vue';
import Toolbar from '@@/Toolbar/Toolbar.vue';
import { useInjectStore } from '@/composables/useInjectStore';

export default defineComponent({
  components: {
    PageLayout,
    Toolbar
  },
  props: {
    contentTransitionName: {
      type: String as PropType<string>,
      required: false,
      default: ''
    }
  },
  setup(){
    const tutorialStore = useInjectStore('tutorialStore');

    const doNotShowAgain = ref(false);

    return {
      doNotShowAgain,
      redirectToTutorial: () => window.open('https://vegud.com', '_blank')?.focus(),
      skipTutorial: async () => {
        await tutorialStore.actions.skip({
          doNotShowAgain: doNotShowAgain.value
        })
      }
    }
  }
});

</script>

<style>
.tutorial-container{
  grid-template-areas:
  "header"
  "explainer"
  "watch-btn"
  "skip-btn"
  "do-not-show-again-btn";
}

</style>