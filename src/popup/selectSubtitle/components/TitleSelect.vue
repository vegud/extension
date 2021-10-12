<template>
  <Select
    :selected="selected"
    :show="show"
    :options="entries"
    filter-placeholder="Filter languages"
    :filter-fn="filter"
    class="px-2 mt-2"
    @update:selected="$emit('update:selected', $event)"
    @update:show="$emit('update:show', $event)"
  >
    <template #currentSelected>
      <span>{{ (selected?.name) }}</span>
    </template>
    <template #default="slotProps">
      <span>{{ slotProps.item.name }}</span>
    </template>
  </Select>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import Select from '@/foundation/components/Select.vue';

interface Entry {
  provider: string;
  id: string;
  language: string;
  name: string;
  path: string;
}

export default defineComponent({
  components: {
    Select
  },
  props: {
    selected: {
      type: Object as PropType<Entry>,
      required: true
    },
    entries: {
      type: Array as PropType<Entry[]>,
      required: true
    },
    show: {
      type: Boolean as PropType<boolean>,
      required: false,
      default: false
    }
  },
  emits: ['update:selected', 'update:show'],
  setup(props) {
    return {
      filter: (query: string) => {
         const lowerCaseQuery = query.toLowerCase();
         return props.entries.filter(({name}) => name.toLowerCase().startsWith(lowerCaseQuery));
      }
    };
  }
});
</script>
