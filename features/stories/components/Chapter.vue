<script setup>
import { mdiPlus } from '@mdi/js';
import { useTranslation } from 'i18next-vue';
import { nextTick, ref } from 'vue';

import { getStoryColor } from '../../../utils/getStoryColor';
import { numberToLetter } from '../../../utils/numberToLetter';

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

const emits = defineEmits(['addNewChapter', 'addNewStep', 'editStoryVisible', 'modelSelected', 'update:chapter', 'open3D', 'open3DLayers', 'openLayers', 'openGeoJSON']);

const { t } = useTranslation();

const updateChapter = (updates) => {
  const updatedChapter = {
    ...props.chapter,
    ...updates
  };
  emits('update:chapter', updatedChapter);
}

const updateStepInChapter = (updatedStep) => {
  const updatedSteps = props.chapter.steps.map((step, idx) =>
    idx === props.activeStepIndex ? updatedStep : step
  );
  updateChapter({steps: updatedSteps});
}

const updateTitle = (event) => updateChapter({title: event.target.value});

const addStep = () => emits('addNewStep');

const chapterTitleRef = ref(null);
const chapterStepRef = ref(null);

const focusChapterTitle = async () => {
  await nextTick();
  chapterTitleRef.value?.focus();
};

defineExpose({
  focusChapterTitle
});
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
        <div class="chapter-label">
          {{ numberToLetter(props.chapter.sequence) }}
        </div>
        <div class="chapter-title">
          <input
            ref="chapterTitleRef"
            :value="props.chapter.title"
            :placeholder="t('additional:modules.dataNarrator.creator.unnamed')"
            type="text"
            required
            @input="updateTitle"
            @keydown.tab.prevent="chapterStepRef?.focusStepTitle()"
          >
        </div>
      </div>
    </div>


    <ChapterStep
      v-if="props.activeStepIndex > -1 && props.activeStepIndex < props.chapter.steps.length"
      ref="chapterStepRef"
      :step="props.chapter.steps[props.activeStepIndex]"
      :chapter-title="props.chapter.title"
      :pill-color="getStoryColor(chapter.id).primary"
      @model-selected="(p) => emits('modelSelected', p)"
      @open3D="emits('open3D')"
      @open3-d-layers="emits('open3DLayers')"
      @open-layers="emits('openLayers')"
      @open-geo-j-s-o-n="emits('openGeoJSON')"
      @update:step="updateStepInChapter"
      @focus-chapter-title="focusChapterTitle"
    />

    <span v-else>
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

<!--    <v-row justify="center">-->
<!--      <v-btn-->
<!--        variant="plain"-->
<!--        class="mt-2"-->
<!--        @click="emits('addNewChapter')"-->
<!--      >-->
<!--        <template #prepend>-->
<!--          <div class="add-chapter-button-icon">-->
<!--            <v-icon>{{ mdiPlus }}</v-icon>-->
<!--          </div>-->
<!--        </template>-->
<!--        Kapitel HINZUFÜGEN-->
<!--      </v-btn>-->
<!--    </v-row>-->
    </span>

  </div>
</template>

<style lang="scss" scoped>
.chapter-container {
  .chapter {
    display: flex;
    align-items: center;
    gap: 6px;
    //background-color: white;
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
        width: 90%;
        margin-left: 2px;

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
