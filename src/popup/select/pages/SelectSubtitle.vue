<template>
  <PageLayout :content-transition-name='contentTransitionName' :has-back="videoCount > 1" :back-fn='backFn'>
    <template #content>
      <div>
        select
      </div>
    </template>
  </PageLayout>
</template>

<script lang='ts'>

import { defineComponent, PropType } from 'vue';
import PageLayout from '@/components/PageLayout.vue';
import { useInjectStore } from '@/composables/useInjectStore';

export default defineComponent({
  components: {
    PageLayout
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

    return {
      videoCount: videoStore.getters.count,
      toSettings: navigationStore.actions.toSettings,
      backFn: (): void => {
        videoStore.actions.removeCurrent();
        navigationStore.actions.toHome();
      }
    };
  }
});
</script>