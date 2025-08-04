<script setup>
import {mdiPinOutline} from "@mdi/js";
import {useTranslation} from "i18next-vue";

import {useStepForm} from "../../../../steps/hooks/useStepForm";
import {useNavigation} from "../../../../steps/hooks/useNavigation";

const {t} = useTranslation();
const {is3d, zoomLevel, centerCoordinates} = useStepForm();
const {zoom, center} = useNavigation();
</script>

<template>
    <div v-if="!is3d" class="navigation-container mb-2 mt-1">
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
                >

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
    </div>
</template>


<style scoped lang="scss">
.navigation-container {
    display: flex;
    gap: 8px;

  .position-container {
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 8px;
    flex: 1;

    .position-inputs {
      display: flex;
      gap: 8px;

      input[type="text"] {
        border-bottom: 1px solid #a1a1a1;
        max-width: 120px;
      }
    }
  }

  .zoom-container {
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 8px;
    width: 100px;

    .zoom-inputs {
      display: flex;
      gap: 8px;

      input[type="text"] {
        border-bottom: 1px solid #a1a1a1;
        max-width: 16px;
      }
    }
  }
}
</style>
