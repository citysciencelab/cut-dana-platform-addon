<script setup>
import { mdiArrowLeft, mdiImagePlusOutline, mdiTrashCan } from '@mdi/js';
import { useTranslation } from 'i18next-vue';
import { computed, ref, watch } from 'vue';
import { useStore } from 'vuex';

import { useDataNarrator } from '../../../hooks/useDataNarrator';
import { use3DLayers } from '../../../hooks/use3DLayers';
import { useIsMobile } from '../../../hooks/useIsMobile';
import { useSceneReset } from '../../../hooks/useSceneReset';
import { backendUrl, dataNarratorModes, ToolwindowModes } from '../../../store/contantsDataNarrator';
import { clearGeoJSON } from '../../../utils/geoJSON';
import { createLogger } from '../../../utils/logger.js';
import ConfirmationDialog from '../../shared/ConfirmationDialog.vue';
import { useNavigation } from '../../../hooks/useNavigation';
import { deleteCoverImage, uploadCoverImage } from '../services/coverImage';
import { createStory } from '../services/createStory';
import { editStory } from '../services/editStory';
import { uploadStepModel } from '../services/uploadStepModel';

import Chapter from './Chapter.vue';
import GeoJSONPanel from './GeoJSON/GeoJSONPanel.vue';
import Layers from './step/layers/Layers.vue';
import ThreeDNavigation from './step/threeDNavigation/components/ThreeDNavigation.vue';
import StoryOverview from './StoryOverview.vue';
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
const { layers3D, loading: loading3DLayers } = use3DLayers();
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
const entityFiles = new Map(); // key: entityId (string) → File
const persistedEntityIds = new Map(); // key: runtime entityId (string) -> persisted entityId (string)
const newStepDraft = ref(null);
const activePanel = ref(null); // null | '3d' | 'layers' | 'geojson'
const validationErrors = ref([]);
const showValidation = ref(false);
const isLoadingStepModels3D = ref(false);
const loaded3DStepSignature = ref('');

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
const threeDLayerItems = computed(() => {
  const layers = layers3D.value ?? [];

  if (!layers.length) {
    return [];
  }

  return [ {
    category: '3D',
    subcategories: [ {
      name: t('additional:modules.dataNarrator.label.layers3D'),
      layers
    } ]
  } ];
});
const threeDLayerIdToLayerMap = computed(() => {
  return new Map(
    (layers3D.value ?? [])
      .filter(layer => layer?.id)
      .map(layer => [ String(layer.id), layer ])
  );
});
const isCreatingNewStep = computed(() => {
  const draft = newStepDraft.value;

  if (!draft || !activeChapter.value || !activeStep.value) {
    return false;
  }

  return activeChapter.value.id === draft.chapterId && activeStep.value.id === draft.stepId;
});


const isEditingStep = computed(() => activeStepIndex.value >= 0 && !previewVisible.value);


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
  if (!descriptionInput.value.trim())
    errors.push(t('additional:modules.dataNarrator.validation.missingStoryDescription'));
  const hasNoChapterWithStep = (chaptersData.value ?? []).length === 0 ||
    (chaptersData.value ?? []).every((ch) => (ch?.steps?.length ?? 0) === 0);
  const hasEmptyChapter = (chaptersData.value ?? []).some((ch) => (ch?.steps?.length ?? 0) === 0);
  if (hasNoChapterWithStep)
    errors.push(t('additional:modules.dataNarrator.validation.missingChapterAndStep'));
  else if (hasEmptyChapter)
    errors.push(t('additional:modules.dataNarrator.validation.chaptersNeedSteps'));
  return errors;
}

function clearValidation() {
  validationErrors.value = [];
  showValidation.value = false;
}

function handleModelCreated({ entityId, file }) {
  if (entityId && file) {
    entityFiles.set(entityId, file);
    // New uploads keep runtime and persisted ID identical.
    persistedEntityIds.set(entityId, entityId);
  }
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
    models3D: [],
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

function reindexAllSteps() {
  let nextStepId = 1;

  for (const chapter of chaptersData.value ?? []) {
    for (const step of chapter.steps ?? []) {
      step.id = nextStepId++;
    }
  }

  if (newStepDraft.value && activeChapter.value && activeStep.value) {
    newStepDraft.value = {
      chapterId: activeChapter.value.id,
      stepId: activeStep.value.id,
    };
  }
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
    steps: [ newStep ],
  };

  chaptersData.value.push(newChapter);

  activeChapterIndex.value = chaptersData.value.length - 1;
  activeStepIndex.value = 0;
  reindexAllSteps();
  newStepDraft.value = {
    chapterId: newChapterId,
    stepId: chaptersData.value[activeChapterIndex.value].steps[activeStepIndex.value].id,
  };
}

function handleAddNewStep({ chapterIdx }) {
  clearValidation();
  const chapter = chaptersData.value[chapterIdx];
  if (!chapter) return;

  const newStep = getDefaultStep(0);

  chapter.steps.push(newStep);
  activeChapterIndex.value = chapterIdx;
  activeStepIndex.value = chapter.steps.length - 1;
  reindexAllSteps();
  newStepDraft.value = {
    chapterId: chapter.id,
    stepId: chaptersData.value[activeChapterIndex.value].steps[activeStepIndex.value].id,
  };
}

function handleDeleteStep({ chapterIdx, stepIdx }) {
  const chapter = chaptersData.value?.[chapterIdx];
  if (!chapter) return;
  if (stepIdx < 0 || stepIdx >= chapter.steps.length) return;

  const deletedStep = chapter.steps[stepIdx];
  const isDeletingDraftStep = (
    newStepDraft.value?.chapterId === chapter.id &&
    newStepDraft.value?.stepId === deletedStep?.id
  );
  chapter.steps.splice(stepIdx, 1);

  if (isDeletingDraftStep) {
    newStepDraft.value = null;
    resetToStoryForm();
  }

  reindexAllSteps();
}

function handleStepsChange({ chapterIdx, newList }) {
  const chapter = chaptersData.value?.[chapterIdx];
  if (!chapter) return;
  chapter.steps = [ ...newList ];
  reindexAllSteps();
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
  reindexAllSteps();

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
  reindexAllSteps();
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

    // Snapshot all currently loaded 3D models into step.models3D
    const importedModelsList = store.getters['Modules/Modeler3D/importedModels'] ?? [];
    if (importedModelsList.length > 0) {
      const importedEntitiesList = store.getters['Modules/Modeler3D/importedEntities'] ?? [];
      const chapter = chaptersData.value[activeChapterIndex.value];
      const step = chapter?.steps[activeStepIndex.value];

      if (step) {
        let dataSourceEntities = null;
        try {
          dataSourceEntities = mapCollection.getMap('3D')
            ?.getDataSourceDisplay()
            ?.defaultDataSource
            ?.entities;
        } catch { /* 3D map may not be ready */
        }

        step.models3D = importedModelsList.map(model => {
          const persistedEntityId = persistedEntityIds.get(model.id) ?? model.id;
          const entityData = importedEntitiesList.find(e => e.entityId === model.id);
          let position = null;
          try {
            const cesiumEntity = dataSourceEntities?.getById(model.id);
            const rawPos = cesiumEntity?.position?.getValue();
            if (rawPos) position = { x: rawPos.x, y: rawPos.y, z: rawPos.z };
          } catch { /* ignore */
          }

          // Preserve existing fileUrl if already uploaded
          const existing = (step.models3D ?? []).find(m => m.entityId === persistedEntityId)
            ?? (step.models3D ?? []).find(m => m.entityId === model.id);

          const resolvedRotation = entityData?.rotation ?? model.heading ?? existing?.rotation ?? 0;
          const resolvedScale = entityData?.scale ?? existing?.scale ?? 1;
          return {
            entityId: persistedEntityId,
            fileUrl: existing?.fileUrl ?? '',
            name: model.name,
            show: model.show,
            heading: resolvedRotation,
            position,
            scale: resolvedScale,
            rotation: resolvedRotation,
          };
        });
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

    if (!dbChapter) continue;

    for (let sIdx = 0; sIdx < ch.steps.length; sIdx++) {
      const uiStep = ch.steps[sIdx];
      const dbStep = dbChapter.StoryStep.find((x) => x.stepNumber === sIdx + 1);

      if (!dbStep) continue;

      // Upload new model files tracked by entityId
      if (Array.isArray(uiStep.models3D) && uiStep.models3D.length > 0) {
        for (const model3D of uiStep.models3D) {
          const file = entityFiles.get(model3D.entityId);
          if (!file) continue; // already uploaded or no new file

          const newFile = await uploadStepModel(storyId, dbStep.id, file, model3D.entityId);
          model3D.fileUrl = `files/${newFile.fileContext}/${newFile.filename}`;
          entityFiles.delete(model3D.entityId);
        }
      }
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
      reindexAllSteps();
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

async function loadModels3DForStep(step) {
  // Clear any stale Cesium entities from previous step
  const prevModels = store.getters['Modules/Modeler3D/importedModels'] ?? [];
  for (const m of [ ...prevModels ]) {
    persistedEntityIds.delete(m.id);
    await store.dispatch('Modules/Modeler3D/deleteEntity', m.id);
  }

  const models = step.models3D ?? [];
  if (!models.length) return;

  for (const model3D of models) {
    if (!model3D.fileUrl) continue;
    try {
      const resp = await fetch(`${backendUrl}/${model3D.fileUrl}`);
      if (!resp.ok) continue;
      const blob = await resp.blob();
      const fileName = model3D.name ?? model3D.fileUrl.split('/').pop()?.split('.')[0] ?? 'model';

      const existingIds = new Set((store.getters['Modules/Modeler3D/importedModels'] ?? []).map(m => m.id));

      store.commit('Modules/Modeler3D/setScale', model3D.scale ?? 1);
      store.commit('Modules/Modeler3D/setRotation', model3D.rotation ?? 0);

      const position = model3D.position ?? { x: 0, y: 0, z: 0 };
      await store.dispatch('Modules/Modeler3D/createEntity', { blob, fileName, position });

      const allModels = store.getters['Modules/Modeler3D/importedModels'] ?? [];
      const newModel = allModels.find(m => !existingIds.has(m.id));

      if (newModel) {
        if (model3D.entityId) {
          // Keep mapping to the stable persisted ID from DB payload.
          persistedEntityIds.set(newModel.id, model3D.entityId);
        }

        const modelScale = model3D.scale ?? 1;
        const modelRotation = model3D.rotation ?? 0;

        try {
          const entities = mapCollection.getMap('3D')
            ?.getDataSourceDisplay()?.defaultDataSource?.entities;
          const entity = entities?.getById(newModel.id);

          if (entity?.model) {
            // Re-apply persisted scale in case createEntity defaulted differently.
            entity.model.scale = modelScale;
          }

          if (entity?.position) {
            const positionValue = entity.position.getValue();
            if (positionValue) {
              entity.orientation = Cesium.Transforms.headingPitchRollQuaternion(
                positionValue,
                new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(modelRotation), 0, 0)
              );
            }
          }
        } catch { /* ignore */
        }

        const importedEntities = [ ...(store.getters['Modules/Modeler3D/importedEntities'] ?? []) ];
        const importedEntity = importedEntities.find(e => e.entityId === newModel.id);
        if (importedEntity) {
          importedEntity.scale = modelScale;
          importedEntity.rotation = modelRotation;
          store.commit('Modules/Modeler3D/setImportedEntities', importedEntities);
        }

        const importedModels = [ ...(store.getters['Modules/Modeler3D/importedModels'] ?? []) ];
        const importedModel = importedModels.find(m => m.id === newModel.id);
        if (importedModel) {
          importedModel.heading = modelRotation;
          store.commit('Modules/Modeler3D/setImportedModels', importedModels);
        }

        // Register entityId → no file needed (already uploaded)
        // update show state if needed
        if (model3D.show === false) {
          try {
            const entities = mapCollection.getMap('3D')
              ?.getDataSourceDisplay()?.defaultDataSource?.entities;
            const entity = entities?.getById(newModel.id);
            if (entity) entity.show = false;
          } catch { /* ignore */
          }
        }
      }
    } catch (err) {
      logger.error('Failed to load 3D model for step edit:', err);
    }
  }
}

function getActiveStep3DSignature() {
  const step = activeStep.value;
  if (!step?.is3D) return '';

  const modelsSignature = (step.models3D ?? [])
    .map(m => `${m.entityId ?? ''}:${m.fileUrl ?? ''}`)
    .join('|');

  return `${activeChapterIndex.value}:${activeStepIndex.value}:${modelsSignature}`;
}

async function ensureActiveStepModels3DLoaded() {
  const step = activeStep.value;
  if (previewVisible.value || !step?.is3D || activeStepIndex.value < 0) {
    const prevModels = store.getters['Modules/Modeler3D/importedModels'] ?? [];
    for (const model of [ ...prevModels ]) {
      persistedEntityIds.delete(model.id);
      await store.dispatch('Modules/Modeler3D/deleteEntity', model.id);
    }
    loaded3DStepSignature.value = '';
    return;
  }

  const signature = getActiveStep3DSignature();
  if (!signature || isLoadingStepModels3D.value || loaded3DStepSignature.value === signature) {
    return;
  }

  isLoadingStepModels3D.value = true;
  try {
    await loadModels3DForStep(step);
    loaded3DStepSignature.value = signature;
  } finally {
    isLoadingStepModels3D.value = false;
  }
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

// Load saved 3D models as soon as user enters a 3D step in edit mode.
watch([ activeChapterIndex, activeStepIndex, previewVisible ], async () => {
  await ensureActiveStepModels3DLoaded();
}, { immediate: true });

// Keep panel-open behavior as a fallback trigger, but avoid duplicate loads.
watch(activePanel, async (panel, prevPanel) => {
  if (panel === '3d' && prevPanel !== '3d') {
    await ensureActiveStepModels3DLoaded();
  }
});

watch(
  [ () => props.storyName, () => props.description, () => props.chapters, () => props.storyId ],
  ([ s, d, c, sId ]) => {
    if (sId) {
      storyNameInput.value = s ?? '';
      descriptionInput.value = d ?? '';
      chaptersData.value = c ?? [];
      reindexAllSteps();
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
          <template v-else-if="activePanel === '3dlayers'">{{
            t('additional:modules.dataNarrator.label.layers3D')
          }}</template>
          <template v-else-if="activePanel === 'layers'">{{
            t('additional:modules.dataNarrator.layer.informationLayersPanel')
          }}</template>
          <template v-else-if="activePanel === 'geojson'">{{
            t('additional:modules.dataNarrator.geojson.panelHeading')
          }}</template>
        </span>
      </div>

      <ThreeDNavigation
        v-if="activePanel === '3d'"
        :model-value="activeStep?.navigation3D ?? {}"
        @update:model-value="updateActiveStepNavigation3D"
        @model-created="handleModelCreated"
      />

      <Layers
        v-else-if="activePanel === '3dlayers'"
        :model-value="activeStep?.layers3D ?? []"
        :items="threeDLayerItems"
        :loading-value="loading3DLayers"
        :id-to-layer-map-value="threeDLayerIdToLayerMap"
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
          :error="showValidation && !isEditingStep && !descriptionInput.trim()"
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
        @open3-d="activePanel = '3d'"
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
          <ul
            class="ma-0 pa-0"
            style="list-style: none;"
          >
            <li
              v-for="err in validationErrors"
              :key="err"
            >
              {{ err }}
            </li>
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
            <v-col
              cols="6"
              class="pa-1"
            >
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
            <v-col
              cols="6"
              class="pa-1"
            >
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
            <v-col
              cols="6"
              class="pa-1"
            >
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
            <v-col
              cols="6"
              class="pa-1"
            >
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
