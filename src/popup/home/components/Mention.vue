<template>
  <div class="text-xs w-full flex flex-wrap items-center self-end justify-center mb-1 gap-1">
    <span>
      <span class="pr-1">Icons by</span>
      <a href="https://fontawesome.com/" target="_blank" class="inline-flex gap-0.5 text-primary-500 hover:text-primary-700 hover:underline">
        <span>Font Awesome</span>
        <FontAwesomeIcon icon="external-link-alt" class="self-center h-icon-sm pb-1" />
      </a>
    </span>
  </div>
</template>
<script>
import FontAwesomeIcon from '@/components/FontAwesomeIcon/FontAwesomeIcon.vue';
export default {
  components: { FontAwesomeIcon }
}
</script>