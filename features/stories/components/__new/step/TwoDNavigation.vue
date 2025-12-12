<script setup>
import { mdiChevronDown, mdiChevronUp, mdiPinOutline } from '@mdi/js';
import { useTranslation } from 'i18next-vue';
import { ref, watch, computed } from 'vue';

import { useNavigation } from '../../../../steps/hooks/useNavigation';

const { t } = useTranslation();
const { zoom, center, zoomIn, zoomOut, canZoomIn, canZoomOut } = useNavigation();

const props = defineProps({
    modelValue: {
        type: Object,
        required: true,
    }
});
const emit = defineEmits([ 'update:modelValue' ]);

const centerCoordinates = ref(props.modelValue.centerCoordinates);
const zoomLevel = ref(props.modelValue.zoomLevel);

const zoomUpdated = computed(() => zoomLevel.value !== zoom.value);
const centerUpdated = computed(() => centerCoordinates.value !== center.value);

watch([ centerCoordinates, zoomLevel ], () => {
    emit('update:modelValue', {
        ...props.modelValue,
        centerCoordinates: (centerCoordinates.value ?? []).map(Number),
        zoomLevel: Number(zoomLevel.value)
    });
});
</script>

<template>
  <div class="navigation-container mb-2 mt-1">
    <div class="field">
      <div class="position-container">
        <div class="position-label">
          Position
        </div>

        <div class="position-inputs">
          <input
            id="step-center-lng"
            v-model="centerCoordinates[0]"
            type="text"
            :class="{'position_change': centerCoordinates && centerCoordinates !== center}"
            :label="t('additional:modules.dataNarrator.label.longitude')"
            :title="t('additional:modules.dataNarrator.label.longitude')"
            disabled
          >

          <input
            id="step-center-lat"
            v-model="centerCoordinates[1]"
            type="text"
            :class="{'position_change': centerCoordinates && centerCoordinates !== center}"
            :label="t('additional:modules.dataNarrator.label.latitude')"
            :title="t('additional:modules.dataNarrator.label.latitude')"
            disabled
          >

          <v-btn
            variant="text"
            size="compact"
            class="ml-auto"
            :icon="mdiPinOutline"
            :title="t('additional:modules.dataNarrator.label.centerCoordinate')"
            @click="() => {centerCoordinates = center}"
          />
        </div>
      </div>

      <div
        v-if="centerUpdated"
        class="input-info"
      >
        Position updated
      </div>
    </div>

    <div class="field">
      <div class="zoom-container">
        <div class="zoom-label">
          Zoom
        </div>

        <div class="zoom-inputs">
          <input
            id="step-zoomlevel"
            v-model="zoomLevel"
            type="text"
            :class="{'position_change': zoomLevel && zoomLevel !== zoom}"
            :label="t('additional:modules.dataNarrator.label.zoomLevel')"
            disabled
            required
          >

          <div class="zoom-stepper">
            <v-btn
              variant="text"
              size="compact"
              :icon="mdiChevronUp"
              class="stepper-btn"
              :title="t('additional:modules.dataNarrator.label.zoomIn')"
              :disabled="!canZoomIn"
              @click="() => {
                zoomIn();
                zoomLevel = zoom;
              }"
            />
            <v-btn
              variant="text"
              size="compact"
              :icon="mdiChevronDown"
              class="stepper-btn"
              :title="t('additional:modules.dataNarrator.label.zoomOut')"
              :disabled="!canZoomOut"
              @click="() => {
                zoomOut();
                zoomLevel = zoom;
              }"
            />
          </div>

          <v-btn
            variant="text"
            size="compact"
            class="ml-auto"
            :icon="mdiPinOutline"
            :title="t('additional:modules.dataNarrator.label.setZoomLevel')"
            @click="() => {zoomLevel = zoom}"
          />
        </div>
      </div>

      <div
        v-if="zoomUpdated"
        class="input-info"
      >
        Zoom updated
      </div>
    </div>
  </div>
</template>


<style scoped lang="scss">
.navigation-container {
    display: flex;
    gap: 8px;

    .field {
        flex: 1;

        .position-container {
            border: 1px solid #ccc;
            border-radius: 4px;
            padding: 8px;

            .position-inputs {
                display: flex;
                gap: 8px;
                padding-top: 14px;

                input[type="text"] {
                    border-bottom: 1px solid #a1a1a1;
                    max-width: 110px;
                }
            }
        }

        .zoom-container {
            border: 1px solid #ccc;
            border-radius: 4px;
            padding: 8px;

            .zoom-inputs {
                display: flex;
                gap: 8px;
                position: relative;
                align-items: flex-end;

                input[type="text"] {
                    border-bottom: 1px solid #a1a1a1;
                    max-width: 16px;
                }

                .zoom-stepper {
                    display: flex;
                    flex-direction: column;

                    .stepper-btn {
                        height: 18px;
                        width: 18px;
                        min-width: 18px;
                        padding: 0;
                    }
                }
            }
        }

        .input-info {
            margin-top: 2px;
            color: #fe8e39;
            font-size: 12px;
        }
    }
}
</style>
