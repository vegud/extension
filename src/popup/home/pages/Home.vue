<template>
  <PageLayout :content-transition-name="contentTransitionName">
    <template #toolbar>
      <Toolbar>
        <a class="self-center pr-4" @click="signOut()">
          <FontAwesomeIcon icon="sign-out-alt" class="h-icon hover:text-on-primary-hover-500"></FontAwesomeIcon>
        </a>
      </Toolbar>
    </template>
    <template #content>
      <div class="flex flex-wrap h-full home-content--container" :class="{ 'bg-surface-100': current === 'select-card' }">
        <ResultFromSelectSubtitle v-if="current === 'select-card'" class="m-2">
          <template #settings>
            <Settings>
              <template #info>
                <div>nothing yet</div>
              </template>
            </Settings>
          </template>
        </ResultFromSelectSubtitle>

        <PageVideos v-else-if="current === 'page-videos'" class="w-full" :select-fn="toSelectSubtitle" />
        <div v-else-if="current === 'unknown'">
          unknown
        </div>
        <Mention/>
      </div>
    </template>
  </PageLayout>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';

import PageLayout from '@/components/PageLayout.vue';
import ResultFromSelectSubtitle from '@@/selectSubtitle/components/ResultFromSelectSubtitle.vue';
import PageVideos from '@/video/components/PageVideos.vue';
import Settings from '@/subtitle/components/Settings.vue';
import { useInjectStore } from '@/composables/useInjectStore';
import Mention from "@@/home/components/Mention.vue";
import FontAwesomeIcon from '@/components/FontAwesomeIcon/FontAwesomeIcon.vue';
import Toolbar from '@@/Toolbar/Toolbar.vue';

export default defineComponent({
  components: {
    PageLayout,
    ResultFromSelectSubtitle,
    PageVideos,
    Settings,
    Mention,
    FontAwesomeIcon,
    Toolbar
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
    const loginStore = useInjectStore('loginStore');
    const navigationStore = useInjectStore('navigationStore');

    return {
      appState: appStore.state,
      signOut: loginStore.actions.signOut,
      toSelectSubtitle: () => navigationStore.actions.toSelectSubtitle(),
      current: computed(() => {
        if (appStore.state.value.state !== 'NONE' && appStore.state.value.src === 'SEARCH') {
          return 'select-card';
        }
        if (appStore.state.value.state === 'NONE') {
          return 'page-videos';
        }
        return 'unknown';
      })
    };
  }
});
</script>

<style scoped>
.home-content--container {
  min-height: 300px;
  max-height: 720px;
}
</style>
