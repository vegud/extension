<template>
  <PageLayout>
    <template #content>
      <div class="flex h-full items-center justify-center">
        <fa icon="circle-notch" class="h-icon-lg animate-spin text-primary-500"/>
      </div>
    </template>
  </PageLayout>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import PageLayout from '@/components/PageLayout.vue';

export default defineComponent({
  components: {
    PageLayout
  }
});
</script>