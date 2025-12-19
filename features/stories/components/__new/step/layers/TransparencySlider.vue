<script setup>
import { ref, watch, defineProps } from 'vue';

const props = defineProps({
  initialOpacity: {
    type: Number,
    default: 100,
  },
});

const opacityValue = ref(props.initialOpacity);

watch(
  () => props.initialOpacity,
  (newVal) => {
    opacityValue.value = newVal;
  }
);

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
          v-model="opacityValue"
          min="0"
          max="100"
          step="1"
          thumb-label="always"
        >
          <template #thumb-label="{ modelValue }">
            {{ String(modelValue) + "%" }}
          </template>
        </v-slider>
      </div>
    </v-card-text>
  </v-card>
</template>
