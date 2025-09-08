<script setup>
import {mdiChevronDown, mdiChevronUp, mdiPinOutline} from "@mdi/js";
import {useTranslation} from "i18next-vue";
import {ref, watch} from "vue";

import {useNavigation} from "../../../../steps/hooks/useNavigation";

const {t} = useTranslation();
const {zoom, center, zoomIn, zoomOut, canZoomIn, canZoomOut} = useNavigation();

const props = defineProps({
    modelValue: {
        type: Object,
        required: true,
    }
});
const emit = defineEmits(['update:modelValue']);

const centerCoordinates = ref(props.modelValue.centerCoordinates);
const zoomLevel = ref(props.modelValue.zoomLevel);

watch([centerCoordinates, zoomLevel], () => {
    emit('update:modelValue', {
        ...props.modelValue,
        centerCoordinates: (centerCoordinates.value ?? []).map(Number),
        zoomLevel: Number(zoomLevel.value)
    });
});
</script>

<template>
    <div class="navigation-container mb-2 mt-1">
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
                    required
                >

                <div class="zoom-stepper">
                    <v-btn
                        variant="text"
                        size="compact"
                        :icon="mdiChevronUp"
                        class="stepper-btn"
                        :title="t('additional:modules.dataNarrator.label.zoomIn')"
                        @click="() => {
                            zoomIn();
                            zoomLevel = zoom;
                        }"
                        :disabled="!canZoomIn"
                    />
                    <v-btn
                        variant="text"
                        size="compact"
                        :icon="mdiChevronDown"
                        class="stepper-btn"
                        :title="t('additional:modules.dataNarrator.label.zoomOut')"
                        @click="() => {
                            zoomOut();
                            zoomLevel = zoom;
                        }"
                        :disabled="!canZoomOut"
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
            padding-top: 14px;

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
}
</style>
