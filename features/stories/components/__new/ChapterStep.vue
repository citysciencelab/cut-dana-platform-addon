<script setup>
import { mdiEye, mdiTrashCan } from '@mdi/js';
import { useTranslation } from 'i18next-vue';
import { ref, watch, nextTick } from 'vue';
import { useStore } from 'vuex';

import AddWMS from '../../../../tools/addWms/components/AddWMS.vue';
import { useNavigation } from '../../../steps/hooks/useNavigation';

import BackgroundMap from './step/BackgroundMap.vue';
import Layers from './step/layers/Layers.vue';
import StepDescription from './step/StepDescription.vue';
import StepTitle from './step/StepTitle.vue';
import ThreeDNavigation from './step/threeDNavigation/components/ThreeDNavigation.vue';
import TwoDNavigation from './step/TwoDNavigation.vue';



const { step } = defineProps({
    step: {
        type: Object,
        required: true
    },
    pillColor: {
        type: String,
    }
});

const emit = defineEmits([ 'modelSelected' ]);

const { t } = useTranslation();
const { setBaseLayer } = useNavigation();
const store = useStore();

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
    debugger;
}

function loadWmsLayer(layer) {
    console.log('load layer', layer);
    store.dispatch("addLayerToLayerConfig", {
        layerConfig: layer,
        parentKey: 'baselayer' // "baselayer" oder "subjectlayer" (analog zu AddWMS aus MP) oder treeBaselayersKey?
        });
    debugger;
}

function removeWmsLayer(id) {
    console.log('remove layer with id', id);
    step.mapSources = step.mapSources.filter(v => v.id !== id);
    debugger;
}

watch(() => step.is3D, (is3DEnabled) => {
    store.dispatch('Maps/changeMapMode', is3DEnabled ? '3D' : '2D');
}, { immediate: true });

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
    <v-row
      class="mb-2"
    >
      <v-col
        cols="1"
        class="p-0"
      >
        <v-btn
          variant="text"
          class="pill-button"
        >
          {{ step.id }}
        </v-btn>
      </v-col>

      <v-col
        cols="11"
        class="p-0"
      >
        <StepTitle
          ref="stepTitleRef"
          v-model:value="step.title"
        />
      </v-col>
    </v-row>

    <v-row class="mb-2">
      <v-col
        cols="12"
        class="p-0"
      >
        <StepDescription v-model:value="step.description" />
      </v-col>
    </v-row>

    <v-row>
      <v-col
        cols="12"
        class="p-0"
      >
        {{ t("additional:modules.dataNarrator.label.mapDisplay") }}
      </v-col>
    </v-row>

    <TwoDNavigation v-model="step.mapConfig" />

    <v-row class="mb-2">
      <v-col
        cols="12"
        class="p-0"
      >
        <BackgroundMap
          v-model="step.mapConfig.backgroundMapId"
          @update:model-value="setBaseLayer"
        />
      </v-col>
    </v-row>

    <v-row class="mb-1">
      <v-col
        cols="12"
        class="p-0"
      >
        Informationsebenen
      </v-col>
    </v-row>

    <Layers v-model="step.informationLayerIds" />

    <v-row class="mb-1">
    <v-col
        cols="12"
        class="p-0"
    >
        WMS-Ebenen
    </v-col>
    </v-row>

    <AddWMS
      @selected="onWmsSelected"
      @error="(msg) => console.error(msg)"
    />

    <v-list
    density="comfortable"
    class="pa-0"
    >
        <v-list-item
        v-for="l in step.mapSources"
        :key="l.id"
        class="pa-0"
        >
        <v-sheet
            width="100%"
            rounded
            class="d-flex align-center px-3 py-2"
            style="border: 1px solid #e1e1e1"
        >
            <v-tooltip location="top">
                <template #activator="{ props: actv }">
                    <v-icon
                    :icon="mdiEye"
                    class="mr-2"
                    @click="loadWmsLayer(l)"
                    v-bind="actv"
                    />
                </template>
                <span> {{ "WMS Layer zu Hintergrundkarten hinzuladen" }} </span>
            </v-tooltip>
            <span class="grow">{{ l.name }}</span>
            <v-icon
            :icon="mdiTrashCan"
            class="cursor-pointer"
            @click="removeWmsLayer(l.id)"
            />
        </v-sheet>
        </v-list-item>

        <div
        v-if="step.mapSources.length === 0"
        class="text-medium-emphasis py-2"
        >
        Keine WMS-Ebenen ausgewählt.
        </div>
    </v-list>

    <div>
      <div class="mb-2">
        3D Navigation
      </div>

      <div class="mb-2">
        <v-switch
          v-model="step.is3D"
          hide-details
          inset
          label="Enable 3D for this step"
        />
      </div>
    </div>

    <ThreeDNavigation
      v-if="step.is3D"
      v-model="step.navigation3D"
      @model-selected="(file) => emit('modelSelected', { step, file })"
    />
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
