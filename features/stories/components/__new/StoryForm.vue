<script setup>
import { mdiArrowLeft, mdiDotsVertical, mdiImagePlusOutline, mdiPencilOutline, mdiTrashCan } from '@mdi/js';
import { useTranslation } from 'i18next-vue';
import { computed, ref, watch } from 'vue';

import { useDataNarrator } from '../../../../hooks/useDataNarrator';
import { dataNarratorModes, ToolwindowModes } from '../../../../store/contantsDataNarrator';
import ConfirmationDialog from '../../../shared/ConfirmationDialog.vue';
import { useNavigation } from '../../../steps/hooks/useNavigation';
import { uploadCoverImage } from '../../services/addCoverImage';
import { createStory } from '../../services/createStory';
import { editStory } from '../../services/editStory';
import { uploadStepModel } from '../../services/uploadStepModel';
import ConfirmSavePopup from '../inputs/ConfirmSavePopup.vue';

import Chapter from './Chapter.vue';
import StoryOverview from './StoryOverview.vue';

const props = defineProps({
  storyId: Number,
  storyName: String,
  description: String,
  chapters: Array,
  storyLoading: Boolean,
  coverImageUrl: String,
});
const { t } = useTranslation();
const { toolwindowMode } = useDataNarrator();
const { gotoPage } = useDataNarrator();

const {
  initialCenter,
  initialZoom,
  removeAllVisibleLayers,
  setAnimatedView
} = useNavigation();

const backConfirmation = ref(false);
const storyName = ref('');
const description = ref('');
const isSaving = ref(false);
const previewVisible = ref(false);
const activeChapterIndex = ref(0);
const activeStepIndex = ref(-1);
const editStoryVisible = ref(true);
const modelFiles = new WeakMap();
const confirmSaveOpen = ref(false);

let nextChapterId = 1;
const chapters = ref([
  {
    id: 0,
    sequence: 1,
    title: '',
    steps: [],
  }
]);

const selectedImage = ref(null);
const imagePreview = computed(() => {
  if (selectedImage.value) return URL.createObjectURL(selectedImage.value);
  return props.coverImageUrl || null;
});

const canPublish = computed(() => {
  const chapterList = chapters.value ?? [];

  const allChaptersHaveSteps =
        chapterList.length > 0 &&
        chapterList.every((ch) => (ch?.steps?.length ?? 0) > 0);

  return allChaptersHaveSteps && storyName.value.trim().length > 0;
});

const activeStep = computed(() => {
  const chapter = chapters.value?.[activeChapterIndex.value];
  if (!chapter) return null;
  const step = chapter.steps?.[activeStepIndex.value];
  return step || null;
});

function handleModelSelected({ step, file }) {
  if (file) modelFiles.set(step, file);
  else modelFiles.delete(step);
}

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

function addNewChapter() {
  const newChapter = {
    id: nextChapterId++,
    sequence: chapters.value.length + 1,
    title: '',
    steps: [],
  };

  chapters.value.push(newChapter);

  activeChapterIndex.value = chapters.value.length - 1;
  activeStepIndex.value = -1;
}

function handleAddNewStep({ chapterIdx }) {
  const chapter = chapters.value[chapterIdx];
  chapter.steps.push(getDefaultStep(chapter.steps.length + 1));
  activeChapterIndex.value = chapterIdx;
  activeStepIndex.value = chapter.steps.length - 1;
}

function handleDeleteStep({ chapterIdx, stepIdx }) {
  const chapter = chapters.value?.[chapterIdx];
  if (!chapter) return;
  if (stepIdx < 0 || stepIdx >= chapter.steps.length) return;
  chapter.steps.splice(stepIdx, 1);
}

function handleStepsChange({ chapterIdx, newList }) {
  const chapter = chapters.value?.[chapterIdx];
  if (!chapter) return;
  chapter.steps = [ ...newList ];
}

function handleEditStep({ chapterIdx, stepIdx }) {
  activeChapterIndex.value = chapterIdx;
  activeStepIndex.value = stepIdx;
  previewVisible.value = false;
}

function handleEditChapter({ chapterIdx }) {
  const chapter = chapters.value?.[chapterIdx];
  if (!chapter) return;
  previewVisible.value = false;
  activeChapterIndex.value = chapterIdx;
  const stepCount = chapters.value[chapterIdx].steps.length ?? 0;
  activeStepIndex.value = stepCount ? stepCount - 1 : -1;
}

function handleDeleteChapter({ chapterIdx }) {
  if (chapterIdx < 0 || chapterIdx >= chapters.value.length) return;
  chapters.value.splice(chapterIdx, 1);
  chapters.value.forEach((ch, i) => (ch.sequence = i + 1));
}

function handleChaptersChange(newList) {
  chapters.value = newList.map((ch, i) => ({
    ...ch,
    sequence: i + 1,
  }));
}

function publishOk() {
  confirmSaveOpen.value = false;
  publish();
}

function publishCancel() {
  confirmSaveOpen.value = false;
}

async function publish() {
  isSaving.value = true;

  const payload = {
    title: String(storyName.value ?? '').trim(),
    description: String(description.value ?? '').trim(),
    chapters: chapters.value
  };

  let storyId = props.storyId;
  let createdStory = payload;

  if (storyId) {
    const updateResp = await editStory(storyId, payload);
    const bodyText = await updateResp.text();
    if (!updateResp.ok) {
      throw new Error(`Failed to edit story: ${updateResp.status} ${bodyText}`);
    }
  } else {
    const createResp = await createStory(payload);
    const bodyText = await createResp.text();
    if (!createResp.ok) {
      throw new Error(`Failed to create story: ${createResp.status} ${bodyText}`);
    }
    createdStory = JSON.parse(bodyText);
    storyId = createdStory.id;
  }

  const uploads = [];
  for (const ch of chapters.value) {
    const dbChapter = createdStory.chapters.find((x) => x.sequence === ch.sequence);
    if (!dbChapter) continue;

    for (let sIdx = 0; sIdx < ch.steps.length; sIdx++) {
      const uiStep = ch.steps[sIdx];
      const file = modelFiles.get(uiStep);
      if (!file) continue;

      const dbStep = dbChapter.StoryStep.find((x) => x.stepNumber === sIdx + 1);
      if (!dbStep) continue;

      await uploadStepModel(storyId, dbStep.id, file);
      modelFiles.delete(uiStep);
    }
  }

  await Promise.all(uploads);

  if (selectedImage.value) {
    try {
      await uploadCoverImage(storyId, selectedImage.value);
    } catch (err) {
      console.error(err);
    }
  }

  isSaving.value = false;
  gotoPage(dataNarratorModes.DASHBOARD);
}

watch(
  [ () => props.storyName, () => props.description, () => props.chapters, () => props.storyId ],
  ([ s, d, c, sId ]) => {
    if (sId) {
      storyName.value = s ?? '';
      description.value = d ?? '';
      chapters.value = c ?? [];
      previewVisible.value = true;
    }
  },
  { immediate: true }
);

watch(activeStepIndex, (activeStepIndex) => {
  if (activeStepIndex >= 0) {
    editStoryVisible.value = false;
  }
});

// When the step is change we remove all visible layers and reset to default base layer
watch([ activeStep, previewVisible ], () => {
  removeAllVisibleLayers();
  if (previewVisible.value == true) {
    setAnimatedView({
      center: initialCenter.value,
      zoom: initialZoom.value
    })
  }
});

</script>

<template>
  <div
    v-if="storyLoading"
    :class="{ 'story-form': true, mobile: toolwindowMode === ToolwindowModes.MOBILE }"
  >
    <v-row>
      <v-col
        cols="12"
        class="p-0 pt-2"
      >
        <v-skeleton-loader
          type="article"
        />
      </v-col>
    </v-row>
  </div>
  <form
    v-else
    :class="{ 'story-form': true, mobile: toolwindowMode === ToolwindowModes.MOBILE }"
    @submit.prevent="true"
  >
    <div
      v-if="editStoryVisible"
      :class="['story-form-top', { 'with-image': (!!selectedImage || !!imagePreview) }]"
    >
      <v-toolbar
        :color="selectedImage ? 'white' : 'transparent'"
        size="compact"
        class="sticky-top"
        style="border-radius: 100px;padding: 0;"
      >
        <template #prepend>
          <v-tooltip location="top">
            <template #activator="{ props: actv}">
              <v-btn
                v-bind="actv"
                :icon="mdiArrowLeft"
                size="compact"
                class="mr-2"
                @click="backConfirmation = true"
              />
            </template>
            <span>{{ t('additional:modules.dataNarrator.label.backToDashboard') }}</span>
          </v-tooltip>

          <v-text-field
            id="title"
            v-model="storyName"
            width="200"
            variant="underlined"
            placeholder="Story name"
            required
          />
          <v-tooltip location="top">
            <template #activator="{ props: actv }">
              <v-file-input
                v-model="selectedImage"
                class="ml-2"
                :prepend-icon="mdiImagePlusOutline"
                hide-input
                accept="image/png, image/jpeg"
                v-bind="actv"
              />
            </template>
            <span>{{ t('additional:modules.dataNarrator.label.imageUpload') }}</span>
          </v-tooltip>
        </template>

        <v-menu
          v-if="editStoryVisible"
          location="bottom end"
          offset="4"
        >
          <template #activator="{ props: menuProps }">
            <v-tooltip location="top">
              <template #activator="{ props: tooltipProps }">
                <v-btn
                  v-bind="{...menuProps, ...tooltipProps}"
                  variant="text"
                  :icon="mdiDotsVertical"
                  size="compact"
                />
              </template>
              <span>{{ t('additional:modules.dataNarrator.label.openStoryMenu') }}</span>
            </v-tooltip>
          </template>
          <v-list density="compact">
            <v-list-item @click.stop="editStoryVisible = false">
              <template #prepend>
                <v-icon :icon="mdiPencilOutline" />
              </template>
              <v-list-item-title>Close Panel</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-toolbar>

      <img
        v-if="imagePreview"
        :src="imagePreview"
        alt="Selected preview"
        class="image-preview"
      >

      <div
        v-if="imagePreview"
        class="remove-image-btn"
      >
        <v-tooltip
          v-if="imagePreview"
          location="top"
        >
          <template #activator="{ props: actv}">
            <v-btn
              v-bind="actv"
              :icon="mdiTrashCan"
              variant="flat"
              density="comfortable"
              @click="selectedImage = null"
            />
          </template>
          <span>{{ t('additional:modules.dataNarrator.label.removeLogoImage') }}</span>
        </v-tooltip>
      </div>
    </div>

    <div class="mb-2">
      <v-textarea
        v-if="editStoryVisible"
        id="description"
        v-model="description"
        variant="outlined"
        hide-details="true"
        rows="3"
        class="bg-white"
        placeholder="Story description"
      />
    </div>

    <div
      v-if="!previewVisible"
      class="story-form-content"
    >
      <Chapter
        :key="chapters[activeChapterIndex]?.id ?? activeChapterIndex"
        :chapter="chapters[activeChapterIndex]"
        :active-step-index="activeStepIndex"
        :edit-story-visible="editStoryVisible"
        @add-new-chapter="addNewChapter"
        @add-new-step="() => {
          previewVisible = false;
          handleAddNewStep({ chapterIdx: activeChapterIndex });
        }"
        @edit-story-visible="editStoryVisible = true"
        @model-selected="handleModelSelected"
      />
    </div>
    <StoryOverview
      v-else
      :chapters="chapters"
      :edit-story-visible="editStoryVisible"
      @edit-story-visible="editStoryVisible = true"
      @add-new-chapter="() => {
        previewVisible = false;
        addNewChapter();
      }"
      @add-new-step="({ chapterIdx }) => {
        previewVisible = false;
        handleAddNewStep({ chapterIdx });
      }"
      @delete-step="handleDeleteStep"
      @steps-change="handleStepsChange"
      @edit-step="handleEditStep"
      @edit-chapter="handleEditChapter"
      @delete-chapter="handleDeleteChapter"
      @chapters-change="handleChaptersChange"
    />

    <v-container class="story-form-footer">
      <v-row justify="center">
        <v-btn
          v-if="!previewVisible"
          type="button"
          class="mr-2"
          variant="outlined"
          color="black"
          @click="previewVisible = !previewVisible"
        >
          ÜBERSICHT
        </v-btn>
        <v-btn
          type="submit"
          variant="flat"
          color="black"
          :loading="isSaving"
          :disabled="!canPublish"
          @click="confirmSaveOpen = true"
        >
          SPEICHERN
        </v-btn>
      </v-row>
    </v-container>
    <!--        <Preview-->
    <!--            :chapters="chapters"-->
    <!--            :hasImage="!!selectedImage || !!imagePreview"-->
    <!--            v-model:open="previewModal"-->
    <!--        />-->
  </form>
  <ConfirmSavePopup
    :dialog-open="confirmSaveOpen"
    :ok-clicked="publishOk"
    :cancel-clicked="publishCancel"
  />

  <ConfirmationDialog
    v-model="backConfirmation"
    :title="t('additional:modules.dataNarrator.confirm.leaveWithoutSaving.title')"
    :message="t('additional:modules.dataNarrator.confirm.leaveWithoutSaving.description')"
    :cancel-text="t('additional:modules.dataNarrator.confirm.leaveWithoutSaving.denyButton')"
    :confirm-text="t('additional:modules.dataNarrator.confirm.leaveWithoutSaving.confirmButton')"
    @confirm="() => gotoPage(dataNarratorModes.DASHBOARD)"
  />
</template>

<style lang="scss">
.story-form {
    position: absolute;
    top: 90px;
    bottom: 90px;
    left: 20px;
    right: 0;
    background-color: #f6f6f6;
    box-shadow: 0 12px 30px -8px rgba(0, 0, 0, 0.30);
    border-radius: .8rem;
    padding: 0 10px;
    display: flex;
    flex-direction: column;

    &.mobile {
        background-color: transparent;
        box-shadow: none;
        top: 30px;
        bottom: 10px;
        right: 10px;
        left: 10px;
    }

    .v-toolbar__content {
        height: 40px !important;
    }

    &-top {
        height: auto;
        margin-top: 10px;
        margin-bottom: 10px;
        position: relative;

        &.with-image {
            height: 260px;
            padding: 10px;
        }

        .image-preview {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            border-radius: 20px;
        }

        .remove-image-btn {
            position: absolute;
            right: 10px;
            bottom: 10px;
        }
    }

    &-content {
        height: 100%;
        overflow-y: auto;

        .add-chapter-button-icon {
            border: 2px solid #584560;
            padding: 0 10px;
            border-radius: 20px;
            font-size: 16px;
            font-weight: bold;
            color: #584560;
            cursor: pointer;
        }
    }

    &-footer {
        margin-top: auto;
        background-color: #f6f6f6;
    }
}
</style>
