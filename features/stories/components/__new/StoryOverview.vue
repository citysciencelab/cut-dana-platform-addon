<script setup>
import {
  mdiDotsVertical,
  mdiPlus,
  mdiDragHorizontalVariant,
  mdiDeleteForeverOutline,
  mdiPencilOutline
} from '@mdi/js';
import { useTranslation } from 'i18next-vue';
import Draggable from 'vuedraggable';

import { getStoryColor } from '../../../../utils/getStoryColor';
import { numberToLetter } from '../../../../utils/numberToLetter';

const { t } = useTranslation();

const emits = defineEmits([
  'addNewChapter',
  'addNewStep',
  'editStep',
  'deleteStep',
  'stepsChange',
  'editChapter',
  'deleteChapter',
  'chaptersChange',
  'editStoryVisible',
]);

const props = defineProps({
  chapters: {
    type: Array,
    default: () => [],
  },
  editStoryVisible: {
    type: Boolean,
  }
});


const onEditStepClick = (chapterIdx, stepIdx) => {
  emits('editStep', { chapterIdx, stepIdx });
};
const onDeleteStepClick = (chapterIdx, stepIdx) => {
  emits('deleteStep', { chapterIdx, stepIdx });
};
const onStepsChange = (chapterIdx, newList) => {
  emits('stepsChange', { chapterIdx, newList });
}

const onEditChapterClick = (chapterIdx) => {
  emits('editChapter', { chapterIdx });
}
const onDeleteChapterClick = (chapterIdx) => {
  emits('deleteChapter', { chapterIdx });
}
const onReorderChapters = (newList) => {
  emits('chaptersChange', newList);
}

const getColor = (idx) => {
  return getStoryColor(idx);
}

</script>

<template>
  <div class="px-2 overflow-auto mt-2">
    <div class="d-flex">
      <div class="flex-1-0 font-bold">
        STRUKTUR
      </div>

      <v-menu
        v-if="!props.editStoryVisible"
        location="bottom end"
        offset="4"
      >
        <template #activator="">
          <v-tooltip location="top">
            <template #activator="{ props: tooltipProps}">
              <v-btn
                v-bind="{...props, ...tooltipProps}"
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

    <Draggable
      :model-value="chapters"
      item-key="id"
      handle=".chapter-handle"
      ghost-class="drag-ghost"
      chosen-class="drag-chosen"
      class="chapter-container d-flex flex-column gap-4"
      :animation="180"
      @update:model-value="val => onReorderChapters(val)"
    >
      <template #item="{ element: chapter, index: idx }">
        <div class="chapter">
          <div class="chapter-header d-flex flex-row align-center mb-2">
            <v-btn
              class="chapter-handle drag-handle cursor-grab"
              variant="text"
              :icon="mdiDragHorizontalVariant"
              size="compact"
              title="Drag"
            />
            <div class="step-content d-flex flex-row align-center rounded-xl ml-2 p-2 flex-1-0">
              <span
                class="chapter-label"
                :style="{ backgroundColor: getColor(idx).primary }"
              >
                {{ numberToLetter(idx + 1) }}
              </span>
              <span class="bold ml-2">
                {{ chapter.title }}
              </span>
              <div class="step-content-action ml-auto d-flex flex-row align-center ga-1">
                <v-tooltip location="top">
                  <template #activator="{ props: tooltipProps}">
                    <v-btn
                      v-bind="{...tooltipProps}"
                      variant="text"
                      :icon="mdiDeleteForeverOutline"
                      size="compact"
                      @click.stop="onDeleteChapterClick(idx)"
                    />
                  </template>
                  <span>{{ t('additional:modules.dataNarrator.deleteChapter') }}</span>
                </v-tooltip>
                <v-tooltip location="top">
                  <template #activator="{ props: tooltipProps}">
                    <v-btn
                      v-bind="{...tooltipProps}"
                      variant="text"
                      :icon="mdiPencilOutline"
                      size="compact"
                      @click.stop="onEditChapterClick(idx)"
                    />
                  </template>
                  <span>{{ t('additional:modules.dataNarrator.editChapter') }}</span>
                </v-tooltip>
              </div>
            </div>
          </div>
          <Draggable
            :model-value="chapter.steps"
            item-key="id"
            handle=".step-handle"
            ghost-class="drag-ghost"
            chosen-class="drag-chosen"
            class="d-flex flex-column gap-2 ml-4"
            :animation="180"
            group="steps"
            @update:model-value="val => onStepsChange(idx, val)"
          >
            <template #item="{ element: step, index: stepIdx }">
              <div class="d-flex flex-row align-center">
                <v-btn
                  class="step-handle drag-handle cursor-grab"
                  variant="text"
                  :icon="mdiDragHorizontalVariant"
                  size="compact"
                  title="Drag"
                />
                <div class="step-content bg-white d-flex flex-row align-center rounded-xl ml-2 p-2 flex-1-0">
                  <span class="pl-2 mr-2">{{ stepIdx + 1 }}</span>
                  <span>{{ step.title }}</span>
                  <div class="step-content-action ml-auto d-flex flex-row align-center ga-1">
                    <v-tooltip location="top">
                      <template #activator="{ props: tooltipProps}">
                        <v-btn
                          v-bind="{...tooltipProps}"
                          variant="text"
                          :icon="mdiDeleteForeverOutline"
                          size="compact"
                          @click.stop="onDeleteStepClick(idx, stepIdx)"
                        />
                      </template>
                      <span>{{ t('additional:modules.dataNarrator.creator.deleteStep') }}</span>
                    </v-tooltip>
                    <v-tooltip location="top">
                      <template #activator="{ props: tooltipProps}">
                        <v-btn
                          v-bind="{...tooltipProps}"
                          variant="text"
                          :icon="mdiPencilOutline"
                          size="compact"
                          @click.stop="onEditStepClick(idx, stepIdx)"
                        />
                      </template>
                      <span>{{ t('additional:modules.dataNarrator.creator.editStep') }}</span>
                    </v-tooltip>
                  </div>
                </div>
              </div>
            </template>
          </Draggable>
          <v-btn
            variant="plain"
            class="text-capitalize ml-12 mt-2 px-0"
            @click="emits('addNewStep', { chapterIdx: idx })"
          >
            <template #prepend>
              <div class="add-step-button-icon">
                <v-icon>{{ mdiPlus }}</v-icon>
              </div>
            </template>
            Neuer Schritt
          </v-btn>
        </div>
      </template>
    </Draggable>
    <v-btn
      variant="plain"
      class="text-capitalize mt-4 px-0"
      @click="emits('addNewChapter')"
    >
      <template #prepend>
        <div class="add-chapter-button-icon">
          <v-icon>{{ mdiPlus }}</v-icon>
        </div>
      </template>
      Neues Kapitel
    </v-btn>
  </div>
</template>

<style lang="scss">
.chapter-container {
  .chapter-label {
      background-color: #413fab;
      padding: 2px 16px;
      border-radius: 20px;
      font-size: 16px;
      font-weight: bold;
      color: white;
  }

  .step-content {
      &-action {
          display: none !important;
      }

      &:hover {
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

          .step-content-action {
              display: flex !important;
          }
      }
  }

  .drag-ghost {
      opacity: 0.3;
  }
}

.add-chapter-button-icon {
    border: 2px solid #584560;
    padding: 0 10px;
    border-radius: 20px;
    font-size: 16px;
    font-weight: bold;
    color: #584560;
    cursor: pointer;
}
</style>
