<script setup>
import { mdiDotsVertical, mdiFormatListBulleted, mdiPencilOutline, mdiPlus } from '@mdi/js';

import { useTranslation } from 'i18next-vue';

import { getStoryColor } from '../../../../utils/getStoryColor';
import { numberToLetter } from '../../../../utils/numberToLetter';
import { useNavigation } from '../../../steps/hooks/useNavigation';

import ChapterStep from './ChapterStep.vue';

const props = defineProps({
  chapter: {
    type: Object,
    required: true
  },
  activeStepIndex: {
    type: Number,
    required: true,
  },
  editStoryVisible: {
    type: Boolean
  }
});

const emits = defineEmits([ 'addNewChapter', 'addNewStep', 'editStoryVisible', 'modelSelected' ]);

const { initialZoom, initialCenter } = useNavigation();
const { t } = useTranslation();

function getDefaultStep(id) {
  return {
    id,
    title: '',
    description: '',
    mapConfig: {
      centerCoordinates: initialCenter,
      zoomLevel: initialZoom,
      backgroundMapId: null,
    },
    informationLayerIds: [],
    mapSources: [],
    // 3D
    is3D: false,
    modelUrl: '',
    navigation3D: {
      coordinates: {
        easting: null,
        northing: null,
      },
      dimensions: {
        height: 0,
        adaptToTerrain: true,
      },
      transforms: {
        rotation: 0,
        scale: 1,
      }
    }

  };
}

function addStep() {
  emits('addNewStep');
}
</script>

<template>
  <div
    v-if="chapter"
    class="chapter-container"
    :style="{
      '--pill-color': getStoryColor(chapter.sequence - 1).primary,
      '--pill-color-secondary': getStoryColor(chapter.sequence - 1).secondary,
    }"
  >
    <div class="d-flex align-center ga-2">
      <div class="chapter flex-1-0">
        <v-icon>{{ mdiFormatListBulleted }}</v-icon>
        <div class="chapter-label">
          {{ numberToLetter(props.chapter.sequence) }}
        </div>
        <div class="chapter-title">
          <input
            v-model="props.chapter.title"
            type="text"
            placeholder="A Unbenanntes Kapitel"
            required
          >
        </div>
        <v-tooltip location="top">
          <template #activator="{ props: actv }">
            <div
              class="chapter-step-add"
              v-bind="actv"
              @click="emits('addNewChapter')"
            >
              <v-icon>{{ mdiPlus }}</v-icon>
            </div>
          </template>
          <span>{{ t('additional:modules.dataNarrator.label.addChapter') }}</span>
        </v-tooltip>
      </div>

      <v-menu
        v-if="!editStoryVisible"
        location="bottom end"
        offset="4"
      >
        <template #activator="{ props: actv }">
          <v-tooltip location="top">
            <template #activator="{ props: tooltipProps}">
              <v-btn
                v-bind="{...actv, ...tooltipProps}"
                variant="text"
                :icon="mdiDotsVertical"
                size="compact"
              />
            </template>
            <span>{{ t('additional:modules.dataNarrator.label.openStoryMenu') }}</span>
          </v-tooltip>
        </template>
        <v-list density="compact">
          <v-list-item @click.stop="emits('editStoryVisible')">
            <template #prepend>
              <v-icon :icon="mdiPencilOutline" />
            </template>
            <v-list-item-title>Edit Story</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>

    <ChapterStep
      v-if="props.activeStepIndex > -1 && props.activeStepIndex < props.chapter.steps.length"
      :step="props.chapter.steps[props.activeStepIndex]"
      :pill-color="getStoryColor(chapter.id).primary"
      @model-selected="(p) => emits('modelSelected', p)"
    />

    <v-row justify="center">
      <v-btn
        variant="plain"
        class="mt-2"
        @click="addStep"
      >
        <template #prepend>
          <div class="add-chapter-button-icon">
            <v-icon>{{ mdiPlus }}</v-icon>
          </div>
        </template>
        SCHRITT HINZUFÜGEN
      </v-btn>
    </v-row>
  </div>
</template>

<style lang="scss" scoped>
.chapter-container {
    .chapter {
        display: flex;
        align-items: center;
        gap: 6px;
        background-color: white;
        border-radius: 50px;
        padding: 8px;

        &-label {
            background-color: var(--pill-color);
            padding: 2px 16px;
            border-radius: 20px;
            font-size: 16px;
            font-weight: bold;
            color: white;
        }

        &-title {
            flex: 1;

            input[type="text"] {
                border: none;
                border-bottom: 1px solid #e1e1e1;
                outline: none;
                font-size: 16px;
                font-weight: bold;
                width: 80%;

                &:focus {
                    border-bottom: 1px solid #a1a1a1;
                }
            }
        }

        &-step-add {
            border: 2px solid #883d06;
            padding: 0 10px;
            border-radius: 20px;
            font-size: 16px;
            font-weight: bold;
            color: #883d06;
            cursor: pointer;
        }
    }

    .add-chapter-button-icon {
        border: 2px solid var(--pill-color);
        padding: 0 10px;
        border-radius: 20px;
        font-size: 16px;
        font-weight: bold;
        color: var(--pill-color);
        cursor: pointer;
    }
}
</style>
