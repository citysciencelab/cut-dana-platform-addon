<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue';

const props = defineProps({
  initialTransparency: {
    type: Number,
    default: 0,
  },
});

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
  <v-card
    class="pa-4"
    outlined
  >
    <v-card-title
      style="line-height: 0.1;"
    >
      Transparenz einstellen
    </v-card-title>
    <v-card-text>
      <div class="d-flex flex-column">
        <v-slider
          v-model="transparencyValue"
          min="0"
          max="100"
          step="1"
          thumb-label="always"
          @end="onSliderEnd"
        >
          <template #thumb-label="{ modelValue }">
            {{ String(modelValue) + "%" }}
          </template>
        </v-slider>
      </div>
    </v-card-text>
  </v-card>
</template>
