<script setup>
import { mdiArrowLeft, mdiImagePlusOutline, mdiTrashCan } from '@mdi/js';
import { useTranslation } from 'i18next-vue';
import { computed, ref, watch } from 'vue';
import { useStore } from 'vuex';

import { useDataNarrator } from '../../../hooks/useDataNarrator';
import { useIsMobile } from '../../../hooks/useIsMobile';
import { dataNarratorModes, ToolwindowModes } from '../../../store/contantsDataNarrator';
import { backendUrl } from '../../../store/contantsDataNarrator';
import { clearGeoJSON } from '../../../utils/geoJSON';
import { createLogger } from '../../../utils/logger.js';
import { useSceneReset } from '../../../hooks/useSceneReset';
import ConfirmationDialog from '../../shared/ConfirmationDialog.vue';
import { useNavigation } from '../../steps/hooks/useNavigation';
import { deleteCoverImage, uploadCoverImage } from '../services/coverImage';
import { createStory } from '../services/createStory';
import { editStory } from '../services/editStory';
import { uploadStepModel } from '../services/uploadStepModel';

import Chapter from './Chapter.vue';
import StoryOverview from './StoryOverview.vue';
import GeoJSONPanel from './GeoJSON/GeoJSONPanel.vue';
import Layers from './step/layers/Layers.vue';
import ThreeDLayerBrowser from './step/threeDNavigation/components/ThreeDLayerBrowser.vue';
import ThreeDNavigation from './step/threeDNavigation/components/ThreeDNavigation.vue';
import ThreeDHint from './ThreeDHint.vue';

const logger = createLogger('StoryForm.vue');
const store = useStore();

const props = defineProps({
  storyId: {
    type: Number,
    default: null
  },
  storyName: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  chapters: {
    type: Array,
    default: () => []
  },
  storyLoading: {
    type: Boolean,
    default: false
  },
  coverImageUrl: {
    type: String,
    default: ''
  },
  isDraft: {
    type: Boolean,
    default: true
  }
});
const { t } = useTranslation();
const { toolwindowMode } = useDataNarrator();
const { gotoPage } = useDataNarrator();
const { resetScene } = useSceneReset();
const { isMobile } = useIsMobile();

const {
  initialCenter,
  initialZoom,
  removeAllVisibleLayers,
  setAnimatedView,
  defaultBaseLayerId
} = useNavigation();

const backConfirmation = ref(false);
const discardNewStepConfirmation = ref(false);
const isPublishing = ref(false);
const storyNameInput = ref('');
const descriptionInput = ref('');
const isSaving = ref(false);
const previewVisible = ref(false);
const activeChapterIndex = ref(0);
const activeStepIndex = ref(-1);
const editStoryVisible = ref(true);
const imageDeleted = ref(false);
const modelFiles = new Map(); // key: `${chapterId}-${stepId}`
const newStepDraft = ref(null);
const activePanel = ref(null); // null | '3d' | 'layers' | 'geojson'
const validationErrors = ref([]);
const showValidation = ref(false);

let nextChapterId = 1;
const chaptersData = ref([]);

const selectedImage = ref(null);
const imagePreview = computed(() => {
  if (imageDeleted.value) return null;
  if (selectedImage.value) return URL.createObjectURL(selectedImage.value);
  return props.coverImageUrl || null;
});

function hasTextContent(value) {
  const normalizedValue = String(value ?? '').trim();

  if (!normalizedValue) {
    return false;
  }

  const doc = new DOMParser().parseFromString(normalizedValue, 'text/html');
  const textContent = doc.body.textContent?.replace(/\s+/g, ' ').trim() ?? '';

  return textContent.length > 0;
}

const activeChapter = computed(() => chaptersData.value?.[activeChapterIndex.value] ?? null);
const activeStep = computed(() => activeChapter.value?.steps?.[activeStepIndex.value] ?? null);
const isCreatingNewStep = computed(() => {
  const draft = newStepDraft.value;

  if (!draft || !activeChapter.value || !activeStep.value) {
    return false;
  }

  return activeChapter.value.id === draft.chapterId && activeStep.value.id === draft.stepId;
});

const canSaveStep = computed(() => {
  return Boolean(
    activeChapter.value?.title?.trim() &&
    activeStep.value?.title?.trim() &&
    hasTextContent(activeStep.value?.description)
  );
});

const canSaveStory = computed(() => {
  const chapterList = chaptersData.value ?? [];

  const allChaptersHaveSteps =
    chapterList.length > 0 &&
    chapterList.every((ch) => (ch?.steps?.length ?? 0) > 0);

  return allChaptersHaveSteps && storyNameInput.value.trim().length > 0;
});

const isEditingStep = computed(() => activeStepIndex.value >= 0 && !previewVisible.value);

  return canSaveStory.value;
});

function getStepErrors() {
  const errors = [];
  if (!activeChapter.value?.title?.trim())
    errors.push(t('additional:modules.dataNarrator.validation.missingChapterTitle'));
  if (!activeStep.value?.title?.trim())
    errors.push(t('additional:modules.dataNarrator.validation.missingStepTitle'));
  if (!hasTextContent(activeStep.value?.description))
    errors.push(t('additional:modules.dataNarrator.validation.missingStepContent'));
  return errors;
}

function getStoryErrors() {
  const errors = [];
  if (!storyNameInput.value.trim())
    errors.push(t('additional:modules.dataNarrator.validation.missingStoryTitle'));
  const hasEmptyChapter = (chaptersData.value ?? []).some((ch) => (ch?.steps?.length ?? 0) === 0);
  if (hasEmptyChapter)
    errors.push(t('additional:modules.dataNarrator.validation.chaptersNeedSteps'));
  return errors;
}

function clearValidation() {
  validationErrors.value = [];
  showValidation.value = false;
}

function handleModelSelected({ step, file }) {
  const chapter = chaptersData.value[activeChapterIndex.value];
  const key = `${chapter?.id}-${step.id}`;
  console.log(`[DEBUG] handleModelSelected: chapter.id=${chapter?.id}, step.id=${step.id}, key=${key}, file=${file?.name ?? 'null'}`);
  if (file) modelFiles.set(key, file);
  else modelFiles.delete(key);
}

function getDefaultStep(id) {
  return {
    id,
    title: '',
    description: '',
    mapConfig: {
      centerCoordinates: initialCenter,
      zoomLevel: initialZoom,
      backgroundMapId: defaultBaseLayerId,
    },
    informationLayers: [],
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
      },
      camera: null,
    }

  };
}

function getNextStepId(chapter) {
  return (chapter?.steps ?? []).reduce((maxId, step) => {
    return Number.isInteger(step?.id) ? Math.max(maxId, step.id) : maxId;
  }, 0) + 1;
}

function resetToStoryForm() {
  activeStepIndex.value = -1;
  previewVisible.value = false;
  editStoryVisible.value = true;
}

function addNewChapter() {
  const newChapterId = nextChapterId++;
  const newStep = getDefaultStep(1);
  const newChapter = {
    id: newChapterId,
    sequence: chaptersData.value.length + 1,
    title: '',
    steps: [newStep],
  };

  chaptersData.value.push(newChapter);

  activeChapterIndex.value = chaptersData.value.length - 1;
  activeStepIndex.value = 0;
  newStepDraft.value = {
    chapterId: newChapterId,
    stepId: newStep.id,
  };
}

function handleAddNewStep({ chapterIdx }) {
  clearValidation();
  const chapter = chaptersData.value[chapterIdx];
  if (!chapter) return;

  const newStep = getDefaultStep(getNextStepId(chapter));

  chapter.steps.push(newStep);
  activeChapterIndex.value = chapterIdx;
  activeStepIndex.value = chapter.steps.length - 1;
  newStepDraft.value = {
    chapterId: chapter.id,
    stepId: newStep.id,
  };
}

function handleDeleteStep({ chapterIdx, stepIdx }) {
  const chapter = chaptersData.value?.[chapterIdx];
  if (!chapter) return;
  if (stepIdx < 0 || stepIdx >= chapter.steps.length) return;

  const deletedStep = chapter.steps[stepIdx];
  chapter.steps.splice(stepIdx, 1);

  if (
    newStepDraft.value?.chapterId === chapter.id &&
    newStepDraft.value?.stepId === deletedStep?.id
  ) {
    newStepDraft.value = null;
    resetToStoryForm();
  }
}

function handleStepsChange({ chapterIdx, newList }) {
  const chapter = chaptersData.value?.[chapterIdx];
  if (!chapter) return;
  chapter.steps = [ ...newList ];
}

function handleEditStep({ chapterIdx, stepIdx }) {
  clearValidation();
  newStepDraft.value = null;
  activeChapterIndex.value = chapterIdx;
  activeStepIndex.value = stepIdx;
  previewVisible.value = false;
}

function handleEditChapter({ chapterIdx }) {
  const chapter = chaptersData.value?.[chapterIdx];
  if (!chapter) return;
  newStepDraft.value = null;
  previewVisible.value = false;
  activeChapterIndex.value = chapterIdx;
  const stepCount = chaptersData.value[chapterIdx].steps.length ?? 0;
  activeStepIndex.value = stepCount ? stepCount - 1 : -1;
}

function handleChapterUpdate(updatedChapter) {
  if (!updatedChapter) {
    return;
  }
  chaptersData.value[activeChapterIndex.value] = updatedChapter;
}

function handleDeleteChapter({ chapterIdx }) {
  if (chapterIdx < 0 || chapterIdx >= chaptersData.value.length) return;

  const deletedChapter = chaptersData.value[chapterIdx];
  chaptersData.value.splice(chapterIdx, 1);
  chaptersData.value.forEach((ch, i) => (ch.sequence = i + 1));

  if (newStepDraft.value?.chapterId === deletedChapter?.id) {
    newStepDraft.value = null;
    resetToStoryForm();
  }
}

function handleChaptersChange(newList) {
  chaptersData.value = newList.map((ch, i) => ({
    ...ch,
    sequence: i + 1,
  }));
}

function saveStep() {
  const errors = getStepErrors();
  if (errors.length) {
    validationErrors.value = errors;
    showValidation.value = true;
    return;
  }
  clearValidation();

  if (activeStep.value?.is3D) {
    const map3d = mapCollection.getMap('3D');
    const scene = map3d?.getCesiumScene();

    if (scene) {
      const camera = scene.camera;
      const cartographic = Cesium.Cartographic.fromCartesian(camera.position);

      const chapter = chaptersData.value[activeChapterIndex.value];
      const step = chapter?.steps[activeStepIndex.value];

      if (step) {
        step.navigation3D = {
          ...step.navigation3D,
          camera: {
            heading: camera.heading,
            pitch: camera.pitch,
            roll: camera.roll,
            position: [
              Cesium.Math.toDegrees(cartographic.longitude),
              Cesium.Math.toDegrees(cartographic.latitude),
              cartographic.height,
            ],
          },
        };
      }
    }

    resetScene();
  }

  newStepDraft.value = null;
  activeStepIndex.value = -1;
  previewVisible.value = true;
}

async function saveStoryData() {
  isSaving.value = true;

  const payload = {
    title: String(storyNameInput.value ?? '').trim(),
    description: String(descriptionInput.value ?? '').trim(),
    chapters: chaptersData.value
  };

  let storyId = props.storyId;
  let createdStory = payload;

  if (storyId) {
    const updateResp = await editStory(storyId, payload);
    const bodyText = await updateResp.text();
    if (!updateResp.ok) {
      throw new Error(`Failed to edit story: ${updateResp.status} ${bodyText}`);
    }
    createdStory = JSON.parse(bodyText);
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
  for (const ch of chaptersData.value) {
    const dbChapter = createdStory.chapters.find((x) => x.sequence === ch.sequence);
    console.log(`[DEBUG] upload-loop: ch.id=${ch.id}, ch.sequence=${ch.sequence}, dbChapter found=${!!dbChapter}`);
    if (!dbChapter) continue;

    for (let sIdx = 0; sIdx < ch.steps.length; sIdx++) {
      const uiStep = ch.steps[sIdx];
      const key = `${ch.id}-${uiStep.id}`;
      const file = modelFiles.get(key);
      console.log(`[DEBUG] upload-loop step: ch.id=${ch.id}, step.id=${uiStep.id}, key=${key}, file=${file?.name ?? 'null'}, modelFiles.size=${modelFiles.size}`);
      if (!file) continue;

      const dbStep = dbChapter.StoryStep.find((x) => x.stepNumber === sIdx + 1);
      console.log(`[DEBUG] upload-loop: dbStep found=${!!dbStep}, stepNumber=${sIdx + 1}`);
      if (!dbStep) continue;

      const newFile = await uploadStepModel(storyId, dbStep.id, file);
      uiStep.modelUrl = `files/${newFile.fileContext}/${newFile.filename}`;
      console.log(`[DEBUG] upload-loop: uploaded, modelUrl=${uiStep.modelUrl}`);
      modelFiles.delete(key);
    }
  }

  await Promise.all(uploads);

  if (selectedImage.value) {
    try {
      await uploadCoverImage(storyId, selectedImage.value);
    } catch (err) {
      logger.error(err);
    }
  } else if (props.coverImageUrl && imageDeleted.value) {
    const response = await deleteCoverImage(props.storyId);
    if (!response.ok) {
      logger.error(`Failed to delete cover image: ${response.status}`);
    } else {
      selectedImage.value = null;
    }
  }

  isSaving.value = false;
  newStepDraft.value = null;
  return storyId;
}

async function save() {
  const errors = isEditingStep.value ? getStepErrors() : getStoryErrors();
  if (errors.length) {
    validationErrors.value = errors;
    showValidation.value = true;
    return;
  }
  clearValidation();
  await saveStoryData();
  removeAllVisibleLayers();
  clearGeoJSON();
  gotoPage(dataNarratorModes.DASHBOARD);
}

async function previewStory() {
  const errors = isEditingStep.value ? getStepErrors() : getStoryErrors();
  if (errors.length) {
    validationErrors.value = errors;
    showValidation.value = true;
    return;
  }
  clearValidation();
  await saveStoryData();
  store.commit('Modules/DataNarrator/setIsPreviewMode', true);
  gotoPage(dataNarratorModes.PLAY_STORY);
}

async function publish() {
  const errors = isEditingStep.value ? getStepErrors() : getStoryErrors();
  if (errors.length) {
    validationErrors.value = errors;
    showValidation.value = true;
    return;
  }
  clearValidation();
  isPublishing.value = true;
  try {
    const storyId = await saveStoryData();
    await fetch(`${backendUrl}/stories/new/${storyId}/publish-state`, {
      method: 'PUT',
      body: JSON.stringify({ isDraft: false }),
    });
  } catch (err) {
    logger.error('Failed to publish story', err);
  } finally {
    isPublishing.value = false;
  }
  removeAllVisibleLayers();
  clearGeoJSON();
  gotoPage(dataNarratorModes.DASHBOARD);
}

function discardNewStep() {
  const draft = newStepDraft.value;

  if (draft) {
    const chapter = chaptersData.value.find((entry) => entry?.id === draft.chapterId);
    const stepIdx = chapter?.steps?.findIndex((step) => step?.id === draft.stepId) ?? -1;

    if (chapter && stepIdx >= 0) {
      chapter.steps.splice(stepIdx, 1);
    }
  }

  newStepDraft.value = null;
  resetScene();
  resetToStoryForm();
}

function onDeleteImage() {
  selectedImage.value = null;
  imageDeleted.value = true;
}

function updateActiveStepNavigation3D(val) {
  const chapter = chaptersData.value[activeChapterIndex.value];
  if (!chapter) return;
  const step = chapter.steps[activeStepIndex.value];
  if (!step) return;
  step.navigation3D = val;
}

function updateActiveStepLayers3D(val) {
  const chapter = chaptersData.value[activeChapterIndex.value];
  if (!chapter) return;
  const step = chapter.steps[activeStepIndex.value];
  if (!step) return;
  step.layers3D = val;
}

function updateActiveStepInformationLayers(val) {
  const chapter = chaptersData.value[activeChapterIndex.value];
  if (!chapter) return;
  const step = chapter.steps[activeStepIndex.value];
  if (!step) return;
  step.informationLayers = val;
}

function updateActiveStepGeoJsonAssets(val) {
  const chapter = chaptersData.value[activeChapterIndex.value];
  if (!chapter) return;
  const step = chapter.steps[activeStepIndex.value];
  if (!step) return;
  step.geoJsonAssets = val;
}

watch(activeStepIndex, () => {
  activePanel.value = null;
});

watch(
  [ () => props.storyName, () => props.description, () => props.chapters, () => props.storyId ],
  ([ s, d, c, sId ]) => {
    if (sId) {
      storyNameInput.value = s ?? '';
      descriptionInput.value = d ?? '';
      chaptersData.value = c ?? [];
      previewVisible.value = true;
      activeStepIndex.value = -1;
      editStoryVisible.value = true;
    }
  },
  { immediate: true }
);

watch(activeStepIndex, (val) => {
  editStoryVisible.value = val < 0;
});

// When the step is change we remove all visible layers and reset to default base layer
watch([ activeStepIndex, previewVisible ], () => {
  removeAllVisibleLayers();
  clearGeoJSON();
  if (previewVisible.value === true) {
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
    <!-- Side panels replace all editor content -->
    <div
      v-if="activePanel"
      class="side-panel"
    >
      <div class="d-flex align-center mb-3 pt-2">
        <v-btn
          :icon="mdiArrowLeft"
          variant="text"
          size="compact"
          class="mr-2"
          @click="activePanel = null"
        />
        <span class="text-body-1 font-weight-medium">
          <template v-if="activePanel === '3d'">{{ t('additional:modules.dataNarrator.3dForm') }}</template>
          <template v-else-if="activePanel === '3dlayers'">{{ t('additional:modules.dataNarrator.label.layers3D') }}</template>
          <template v-else-if="activePanel === 'layers'">{{ t('additional:modules.dataNarrator.layer.informationLayersPanel') }}</template>
          <template v-else-if="activePanel === 'geojson'">{{ t('additional:modules.dataNarrator.geojson.panelHeading') }}</template>
        </span>
      </div>

      <ThreeDNavigation
        v-if="activePanel === '3d'"
        :model-value="activeStep?.navigation3D ?? {}"
        @update:model-value="updateActiveStepNavigation3D"
        @model-selected="(file) => handleModelSelected({ step: activeStep, file })"
      />

      <ThreeDLayerBrowser
        v-else-if="activePanel === '3dlayers'"
        :model-value="activeStep?.layers3D ?? []"
        @update:model-value="updateActiveStepLayers3D"
      />

      <Layers
        v-else-if="activePanel === 'layers'"
        :model-value="activeStep?.informationLayers ?? []"
        @update:model-value="updateActiveStepInformationLayers"
      />

      <GeoJSONPanel
        v-else-if="activePanel === 'geojson'"
        :model-value="activeStep?.geoJsonAssets ?? []"
        @update:model-value="updateActiveStepGeoJsonAssets"
      />
    </div>

    <template v-else>
      <div
        v-if="editStoryVisible"
        :class="['story-form-top', { 'with-image': (!!selectedImage || !!imagePreview) }]"
      >
        <div
          v-if="imagePreview"
          class="image-preview"
        >
          <img
            :src="imagePreview"
            alt="Selected preview"
          >
          <div class="remove-image-btn">
          <v-tooltip location="top">
            <template #activator="{ props: actv}">
              <v-btn
                v-bind="actv"
                :icon="mdiTrashCan"
                variant="flat"
                density="comfortable"
                @click="onDeleteImage"
              />
            </template>
            <span>{{ t('additional:modules.dataNarrator.label.removeLogoImage') }}</span>
          </v-tooltip>
        </div>
      </div>

      <v-toolbar
        :color="selectedImage ? 'white' : 'transparent'"
        size="compact"
        class="sticky-top"
        style="border-radius: 100px;padding: 0;"
      >
        <v-text-field
          id="title"
          v-model="storyNameInput"
          class="story-title-input"
          variant="underlined"
          :placeholder="t('additional:modules.dataNarrator.label.storyNamePlaceholder')"
          :error="showValidation && !isEditingStep && !storyNameInput.trim()"
          required
        />

        <template #append>
          <v-tooltip location="top">
            <template #activator="{ props: actv }">
              <v-file-input
                v-model="selectedImage"
                class="mr-2"
                :prepend-icon="mdiImagePlusOutline"
                hide-input
                accept="image/png, image/jpeg"
                v-bind="actv"
                @change="imageDeleted = false"
              />
            </template>
            <span>{{ t('additional:modules.dataNarrator.label.imageUpload') }}</span>
          </v-tooltip>
        </template>
      </v-toolbar>
    </div>

    <div class="mb-2">
      <v-textarea
        v-if="editStoryVisible"
        id="description"
        v-model="descriptionInput"
        variant="outlined"
        hide-details="true"
        rows="3"
        class="bg-white"
        :placeholder="t('additional:modules.dataNarrator.label.storyDescriptionPlaceholder')"
      />
    </div>

      <Chapter
        v-if="activeStepIndex >= 0"
        :key="chaptersData[activeChapterIndex]?.id ?? activeChapterIndex"
        :chapter="chaptersData[activeChapterIndex]"
        :active-step-index="activeStepIndex"
        :edit-story-visible="editStoryVisible"
        :show-validation="showValidation"
        @add-new-chapter="addNewChapter"
        @add-new-step="() => {
          previewVisible = false;
          handleAddNewStep({ chapterIdx: activeChapterIndex });
        }"
        @edit-story-visible="editStoryVisible = true"
        @model-selected="handleModelSelected"
        @open3D="activePanel = '3d'"
        @open3-d-layers="activePanel = '3dlayers'"
        @open-layers="activePanel = 'layers'"
        @open-geo-j-s-o-n="activePanel = 'geojson'"
        @update:chapter="handleChapterUpdate"
      />

    <StoryOverview
      v-if="activeStepIndex === -1"
      :chapters="chaptersData"
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
      <!-- Validation error banner -->
      <v-alert
        v-if="validationErrors.length"
        type="error"
        variant="tonal"
        density="compact"
        class="mb-2"
        :closable="true"
        @click:close="clearValidation()"
      >
        <ul class="ma-0 pa-0" style="list-style: none;">
          <li v-for="err in validationErrors" :key="err">{{ err }}</li>
        </ul>
      </v-alert>

      <!-- While creating a new step: cancel + save step -->
      <template v-if="isCreatingNewStep">
        <v-row justify="center">
          <v-btn
            type="button"
            variant="outlined"
            color="black"
            class="mr-2"
            @click="discardNewStepConfirmation = true"
          >
            {{ t('additional:modules.dataNarrator.button.cancel') }}
          </v-btn>
          <v-btn
            type="submit"
            variant="flat"
            color="black"
            @click="saveStep()"
          >
            {{ t('additional:modules.dataNarrator.creator.saveStep') }}
          </v-btn>
        </v-row>
      </template>
      <!-- Step editing: only cancel + save step -->
      <template v-else-if="isEditingStep">
        <v-row justify="center">
          <v-btn
            type="button"
            variant="outlined"
            color="black"
            class="mr-2"
            @click="backConfirmation = true"
          >
            {{ t('additional:modules.dataNarrator.button.cancel') }}
          </v-btn>
          <v-btn
            type="submit"
            variant="flat"
            color="black"
            :loading="isSaving"
            @click="saveStep()"
          >
            {{ t('additional:modules.dataNarrator.creator.saveStep') }}
          </v-btn>
        </v-row>
      </template>
      <!-- Normal story editing: 2x2 grid -->
      <template v-else>
        <v-row class="mb-1">
          <v-col cols="6" class="pa-1">
            <v-btn
              type="submit"
              variant="flat"
              color="black"
              block
              :loading="isSaving"
              @click="save()"
            >
              {{ t('additional:modules.dataNarrator.button.submitEditStep') }}
            </v-btn>
          </v-col>
          <v-col cols="6" class="pa-1">
            <v-btn
              type="button"
              variant="flat"
              color="primary"
              block
              :loading="isPublishing"
              @click="publish()"
            >
              {{ t('additional:modules.dataNarrator.button.publish') }}
            </v-btn>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="6" class="pa-1">
            <v-btn
              type="button"
              variant="outlined"
              color="black"
              block
              @click="backConfirmation = true"
            >
              {{ t('additional:modules.dataNarrator.button.cancel') }}
            </v-btn>
          </v-col>
          <v-col cols="6" class="pa-1">
            <v-btn
              type="button"
              variant="outlined"
              color="black"
              block
              @click="previewStory()"
            >
              {{ t('additional:modules.dataNarrator.button.previewStory') }}
            </v-btn>
          </v-col>
        </v-row>
      </template>
    </v-container>




    </template>
  </form>
  <ConfirmationDialog
    v-model="backConfirmation"
    :title="t('additional:modules.dataNarrator.confirm.leaveWithoutSaving.title')"
    :message="t('additional:modules.dataNarrator.confirm.leaveWithoutSaving.description')"
    :cancel-text="t('additional:modules.dataNarrator.confirm.leaveWithoutSaving.denyButton')"
    :confirm-text="t('additional:modules.dataNarrator.confirm.leaveWithoutSaving.confirmButton')"
    @confirm="() => { resetScene(); gotoPage(dataNarratorModes.DASHBOARD); }"
  />
  <ConfirmationDialog
    v-model="discardNewStepConfirmation"
    :title="t('additional:modules.dataNarrator.confirm.discardNewStep.title')"
    :message="t('additional:modules.dataNarrator.confirm.discardNewStep.description')"
    :cancel-text="t('additional:modules.dataNarrator.confirm.discardNewStep.denyButton')"
    :confirm-text="t('additional:modules.dataNarrator.confirm.discardNewStep.confirmButton')"
    @confirm="discardNewStep"
  />
  <ThreeDHint :visible="!isMobile && !!activeStep?.is3D" />
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
  overflow-y: auto;

  &.mobile {
    background-color: transparent;
    box-shadow: none;
    top: 30px;
    bottom: 0;
    right: 10px;
    left: 10px;
  }

  .v-toolbar__content {
    height: 40px !important;
  }

  &-top {
    height: auto;
    margin-top: 8px;
    margin-bottom: 6px;
    position: relative;

    &.with-image {
      padding: 10px 0;
    }

    .image-preview {
      position: relative;
      width: 100%;
      margin-bottom: 10px;

      img {
        width: 100%;
        height: 180px;
        border-radius: 20px;
        object-fit: cover;
      }

      .remove-image-btn {
        position: absolute;
        right: 10px;
        bottom: 10px;
      }
    }

    .story-title-input {
      flex: 1 1 auto;
      min-width: 0;
    }

  }

  &-content {
    height: 100%;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: #c1c1c1 transparent;

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

.side-panel {
  padding: 0 4px;
  overflow-y: auto;
  flex: 1;
}
</style>
