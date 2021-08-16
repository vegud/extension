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
import { computed, defineComponent, PropType } from 'vue';
import Select from '@/components/Select.vue';
import { capitalizeFirst } from '@/util/string';
import languageList from '@/res/iso639List.json';

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
        return props.entries;
        // const lowerCaseQuery = query.toLowerCase();
        // return languageList.filter(({ iso639Name, iso639_2 }) => iso639Name.toLowerCase().startsWith(query) || iso639_2.toLowerCase().startsWith(lowerCaseQuery));
      }
    };
  }
});
</script>
