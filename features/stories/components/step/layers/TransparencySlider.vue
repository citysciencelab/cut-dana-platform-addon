<script setup>
import { useTranslation } from 'i18next-vue';
import { ref, watch, defineProps, defineEmits } from 'vue';

const props = defineProps({
  initialTransparency: {
    type: Number,
    default: 0,
  },
});

const { t } = useTranslation();

const emit = defineEmits([ 'update', 'final' ]);
const transparencyValue = ref(props.initialTransparency);

watch(
  () => props.initialTransparency,
  (newVal) => {
    transparencyValue.value = newVal;
  }
);

watch(transparencyValue, (val) => {
  emit('update', val);
});

function onSliderEnd(val) {
  emit('final', val);
}
</script>

<template>
  <div class="transparency-slider px-3 pt-1 pb-0">
    <span class="label">{{ t("additional:modules.dataNarrator.label.changeTransparency") }}</span>
    <v-slider
      v-model="transparencyValue"
      min="0"
      max="100"
      step="1"
      thumb-label="always"
      density="compact"
      hide-details
      @end="onSliderEnd"
    >
      <template #thumb-label="{ modelValue }">
        {{ String(modelValue) + "%" }}
      </template>
    </v-slider>
  </div>
</template>

<style scoped lang="scss">
.transparency-slider {
  border: 1px solid #e1e1e1;
  border-radius: 4px;
  background: #fafafa;

  .label {
    display: block;
    font-size: 0.75rem;
    color: #666;
    margin-bottom: -6px;
  }
}
</style>
