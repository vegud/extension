<template>
  <PageLayout :content-transition-name="contentTransitionName">
    <template #toolbar>
      <Toolbar has-back :back-fn="backFn"/>
    </template>
    <template #content>
      <div class="pt-2 px-2">
        <div class="font-header font-medium text-xl">User data</div>
        <div class="flex w-full justify-end px-4">
          <a class="text-primary-500 hover:text-primary-700" @click="clearUserData">
            <span class="pr-1"> Reset </span>
          </a>
        </div>
      </div>
    </template>
  </PageLayout>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { clear as storageClear } from 'storage';

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
  setup() {
    const navigationStore = useInjectStore('navigationStore');
    const videoStore = useInjectStore('videoStore');
    const loginStore = useInjectStore('loginStore');

    return {
      clearUserData: async () => {
        await storageClear();
        loginStore.actions.signOut();
      },
      backFn: () => (videoStore.getters.count.value === 1 ? navigationStore.actions.toSelectSubtitle() : navigationStore.actions.toHome())
    };
  }
});
</script>
