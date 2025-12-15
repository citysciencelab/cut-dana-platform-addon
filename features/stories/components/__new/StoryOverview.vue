<script setup>
import { mdiDotsVertical, mdiPlus, mdiEqual, mdiDeleteForeverOutline, mdiPencilOutline } from '@mdi/js';
import Draggable from 'vuedraggable';

import { getStoryColor } from '../../../../utils/getStoryColor';
import { numberToLetter } from '../../../../utils/numberToLetter';
import { useTranslation } from 'i18next-vue';

const { t } = useTranslation();

const emits = defineEmits([
    'addNewChapter',
    'deleteStep',
    'reorderSteps',
    'editStep',
    'editChapter',
    'deleteChapter',
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

const onDeleteClick = (chapterIdx, stepIdx) => {
    emits('deleteStep', { chapterIdx, stepIdx });
};

const onReorder = (chapterIdx, newList) => {
    emits('reorderSteps', { chapterIdx, newList });
}

const onEditStepClick = (chapterIdx, stepIdx) => {
    emits('editStep', { chapterIdx, stepIdx });
};

const onEditChapterClick = (chapterIdx) => {
    emits('editChapter', { chapterIdx });
}

const onDeleteChapterClick = (chapterIdx) => {
    emits('deleteChapter', { chapterIdx });
}
</script>

<template>
  <div class="px-2 overflow-auto mt-2">
    <div class="d-flex">
      <div class="flex-1-0 font-bold">
        STRUKTUR
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

    <div
      v-for="(chapter, idx) in props.chapters"
      :key="chapter.id ?? idx"
      class="chapter-container"
    >
      <div class="chapter">
        <div
          class="chapter-label"
          :style="{ backgroundColor: getStoryColor(idx).primary }"
        >
          {{ numberToLetter(idx + 1) }}
        </div>
        <div class="chapter-title">
          {{ chapter.title }}
        </div>
        <v-menu
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
              <span>{{ t('additional:modules.dataNarrator.label.openChapterMenu') }}</span>
            </v-tooltip>
          </template>
          <v-list density="compact">
            <v-list-item @click.stop="onEditChapterClick(idx)">
              <template #prepend>
                <v-icon :icon="mdiPencilOutline" />
              </template>
              <v-list-item-title>Edit</v-list-item-title>
            </v-list-item>
            <v-list-item @click.stop="onDeleteChapterClick(idx)">
              <template #prepend>
                <v-icon :icon="mdiDeleteForeverOutline" />
              </template>
              <v-list-item-title>Delete</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>

      <Draggable
        :model-value="chapter.steps"
        item-key="id"
        handle=".drag-handle"
        ghost-class="drag-ghost"
        chosen-class="drag-chosen"
        class="d-flex flex-column ga-2"
        :animation="180"
        @update:model-value="val => onReorder(idx, val)"
      >
        <template #item="{ element: step, index: stepIdx }">
          <div class="d-flex flex-row align-center">
            <v-btn
              class="drag-handle cursor-grab"
              variant="text"
              :icon="mdiEqual"
              size="compact"
              title="Drag"
            />
            <div class="step-content bg-white d-flex flex-row align-center rounded-xl ml-2 p-2 flex-1-0">
              <span class="pl-2 mr-2">{{ stepIdx + 1 }}</span>
              <span>{{ step.title }}</span>

              <div class="step-content-action ml-auto d-flex flex-row align-center ga-1">
                <v-tooltip location="top">
                  <template #activator="{ props:actv }">
                    <v-btn
                      v-bind="actv"
                      variant="text"
                      :icon="mdiDeleteForeverOutline"
                      size="compact"
                      @click.stop="onDeleteClick(idx, stepIdx)"
                    />
                  </template>    
                  <span>{{ t('additional:modules.dataNarrator.creator.deleteStep') }}</span> 
                </v-tooltip>
                <v-tooltip location="top">
                  <template #activator="{ props: actv}">
                    <v-btn
                      variant="text"
                      :icon="mdiDotsVertical"
                      size="compact"
                      @click.stop="onEditStepClick(idx, stepIdx)"
                      v-bind="actv"
                    />
                  </template>
                  <span>{{ t('additional:modules.dataNarrator.creator.editStep') }}</span>
                </v-tooltip>
              </div>
            </div>
          </div>
        </template>
      </Draggable>
    </div>

    <v-btn
      variant="plain"
      class="text-capitalize mt-2 px-0"
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
    .chapter {
        display: flex;
        align-items: center;
        gap: 6px;
        border-radius: 50px;
        padding: 8px 0;

        &-label {
            background-color: #413fab;
            padding: 2px 16px;
            border-radius: 20px;
            font-size: 16px;
            font-weight: bold;
            color: white;
        }

        &-title {
            flex: 1;
            font-size: 16px;
            font-weight: 600;
        }
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
