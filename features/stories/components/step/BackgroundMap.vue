<script setup>
import { computed } from 'vue';
import { useTranslation } from 'i18next-vue';

import { useBaseLayer } from '../../hooks/useBaseLayer';

const { items } = useBaseLayer();
const { t } = useTranslation();

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  }
});
const emit = defineEmits([ 'update:modelValue' ]);

const inputValue = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v)
});
</script>

<template>
  <v-select
    v-model="inputValue"
    :items="items"
    density="comfortable"
    :label="t('additional:modules.dataNarrator.label.backgroundMap')"
    variant="outlined"
    hide-details
  />
</template>
