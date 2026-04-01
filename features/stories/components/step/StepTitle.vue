<script setup>
import { useTranslation } from 'i18next-vue';
import { computed, nextTick, ref } from 'vue';

const props = defineProps({
  value: {
    type: String,
    default: ''
  },
  error: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits([ 'update:value', 'tab' ]);
const inputValue = computed({
  get() {
    return props.value
  },
  set(v) {
    emit('update:value', v)
  }
});

const fieldRef = ref(null);

defineExpose({
  async focus() {
    await nextTick();
    fieldRef.value?.focus?.();
  },
});

const { t } = useTranslation();
</script>

<template>
  <v-text-field
    ref="fieldRef"
    v-model="inputValue"
    variant="outlined"
    density="comfortable"
    :label="t('additional:modules.dataNarrator.label.stepTitle')"
    :autofocus="true"
    :error="error"
    hide-details
    required
    @keydown.tab.prevent="emit('tab')"
  />
</template>
