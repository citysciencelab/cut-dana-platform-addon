<script setup>
import {useTranslation} from "i18next-vue";
import {ref, watch, nextTick} from "vue";

import StepTitle from "./step/StepTitle.vue";
import StepDescription from "./step/StepDescription.vue";
import TwoDNavigation from "./step/TwoDNavigation.vue";
import BackgroundMap from "./step/BackgroundMap.vue";
import Layers from "./step/layers/Layers.vue";
import {useNavigation} from "../../../steps/hooks/useNavigation";
import AddWMS from "../../../../tools/addWms/components/AddWMS.vue";
import ThreeDNavigation from "./step/ThreeDNavigation.vue";

const {step} = defineProps({
    step: {
        type: Object,
        required: true
    },
    pillColor: {
        type: String,
    }
});

const {t} = useTranslation();
const {setBaseLayer} = useNavigation();

const stepTitleRef = ref(null);

function onWmsSelected(sources) {
    if (!Array.isArray(step.mapSources)) step.mapSources = [];
    const existing = new Set(step.mapSources.map((s) => s.id));
    for (const src of sources) {
        if (!existing.has(src.id)) {
            src.showInLayerTree = false;
            step.mapSources.push(src);
        }
    }
}

watch(
    () => step?.id,
    async () => {
        await nextTick();
        stepTitleRef.value?.focus?.();
    },
);
</script>

<template>
    <div class="chapter-step px-2 pt-1 pb-2">
        <v-row class="mb-2" align="center">
            <v-col cols="1" class="p-0">
                <v-btn
                    variant="text"
                    class="pill-button"
                >
                    {{ step.id }}
                </v-btn>
            </v-col>

            <v-col cols="11" class="p-0">
                <StepTitle ref="stepTitleRef" v-model:value="step.title"/>
            </v-col>
        </v-row>

        <v-row class="mb-2">
            <v-col cols="12" class="p-0">
                <StepDescription v-model:value="step.description"/>
            </v-col>
        </v-row>

        <v-row>
            <v-col cols="12" class="p-0">
                {{ t("additional:modules.dataNarrator.label.mapDisplay") }}
            </v-col>
        </v-row>

        <TwoDNavigation v-model="step.mapConfig"/>

        <v-row class="mb-2">
            <v-col cols="12" class="p-0">
                <BackgroundMap
                    v-model="step.mapConfig.backgroundMapId"
                    @update:modelValue="setBaseLayer"
                />
            </v-col>
        </v-row>

        <v-row class="mb-1">
            <v-col cols="12" class="p-0">
                Informationsebenen
            </v-col>
        </v-row>

        <Layers v-model="step.informationLayerIds"/>

        <AddWMS
            @selected="onWmsSelected"
            @error="(msg) => console.error(msg)"
        />

        <ThreeDNavigation/>
    </div>
</template>

<style lang="scss">
.chapter-step {
    background-color: white;
    border-radius: 15px;
    margin-top: 10px;

    .pill-button {
        .v-btn__content {
            width: 20px !important;
            border: 2px solid var(--pill-color);
            color: var(--pill-color);
            font-weight: bold;
        }
    }
}
</style>
