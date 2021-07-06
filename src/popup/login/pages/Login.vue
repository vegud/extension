<template>
  <PageLayout :content-transition-name='contentTransitionName'>
    <template #content>
      <div class="flex justify-center items-center h-full flex-col">
        <div>LOGIN PAGE</div>
        <div v-if="lastError && lastError === 'NOT_REGISTERED'" class='mt-2'>
          <div class='mt-2'>You are currently not registered on vegud.com</div>
          <a href="https://vegud.com/" target="_blank" class="inline-flex gap-0.5 text-primary-500 hover:text-primary-700 hover:underline mt-2" @click='close'>
            <span>Register Here</span>
            <fa icon="external-link-alt" class="self-center h-icon-sm pb-1" />
          </a>
        </div>
        <div v-else-if="lastError">
          <div> {{lastError }}</div>
        </div>
      </div>
    </template>
  </PageLayout>
</template>

<script lang='ts'>

import { defineComponent, PropType } from 'vue';
import PageLayout from '@/components/PageLayout.vue';
import { useInjectStore } from '@/composables/useInjectStore';
import { close } from '@/components/Toolbar/close';

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
    const loginStore = useInjectStore('loginStore');
    return {
      lastError: loginStore.getters.lastError,
      close
    };
  }
});
</script>