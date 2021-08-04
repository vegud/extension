<template>
  <PageLayout :content-transition-name="contentTransitionName" has-back :back-fn="backFn">
    <template #content>
      <div class="pt-2 px-2">
        <div class="font-header font-medium text-xl">User data</div>
        <div style="grid-area: detail; grid-template-columns: auto 1fr; grid-column-gap: 16px" class="grid w-full leading-relaxed">
          <div style="grid-column: 1 / 2" class="font-medium">Api</div>
          <div style="grid-column: 2 / 3" class="flex items-center">
            <label for="stable" class="pr-1">stable</label>
            <input id="stable" v-model="apiVersion" type="radio" value="stable" class="mr-1 text-primary-700 focus:ring-0 focus:ring-offset-0" />
            <label for="dev" class="pl-2 pr-1">dev</label>
            <input id="dev" v-model="apiVersion" type="radio" value="dev" class="mr-1 text-primary-700 focus:ring-0 focus:ring-offset-0" />
          </div>
        </div>
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
