<script setup>
import { mdiChevronLeft, mdiChevronRight, mdiClose } from '@mdi/js';
import { useTranslation } from 'i18next-vue';
import scrollama from 'scrollama';
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { useStore } from 'vuex';

import { useDataNarrator } from '../../../hooks/useDataNarrator';
import { useIsMobile } from '../../../hooks/useIsMobile';
import { useNavigation } from '../../../hooks/useNavigation';
import { useSceneReset } from '../../../hooks/useSceneReset';
import { backendUrl, dataNarratorModes } from '../../../store/contantsDataNarrator';
import { addGeoJSON, clearGeoJSON } from '../../../utils/geoJSON';
import { getFileUrl } from '../../../utils/getFileUrl';
import { getStoryColor } from '../../../utils/getStoryColor';
import { createLogger } from '../../../utils/logger.js';
import { numberToLetter } from '../../../utils/numberToLetter';
import ConfirmationDialog from '../../shared/ConfirmationDialog.vue';
import ToolWindow from '../../shared/Toolwindow/ToolWindow.vue';
import { useStory } from '../hooks/useStory';

import PlayerFrame from './play/PlayerFrame.vue';
import RichTextViewer from './step/RichTextViewer.vue';
import ThreeDHint from './ThreeDHint.vue';

const logger = createLogger('PlayStory.vue');
const { t } = useTranslation();
const { gotoPage } = useDataNarrator()
const { resetScene } = useSceneReset();
const { currentStoryId } = useStory();
const { isMobile } = useIsMobile();
const {
  defaultBaseLayerId,
  initialZoom,
  initialCenter,
  setAnimatedView,
  setBaseLayer,
  setInformationLayers,
  removeAllVisibleLayers
} = useNavigation();
const store = useStore();

const story = ref(null);
const isLoading = ref(true);

const stage = ref('overview');
const chapterIndex = ref(0);
const stepIndex = ref(0);
const pendingStepFromUrl = ref(getRequestedStepFromUrl());
const pendingScrollTarget = ref(null);
const scrollyRoot = ref(null);
const scroller = ref(null);
const scrollStepElements = ref([]);
const closeConfirmation = ref(false);

const totalSteps = computed(() => {
  if (!story.value) return 0;
  return story.value.chapters.reduce(
    (sum, chap) => sum + chap.steps.length,
    0
  );
});
const flattenedSteps = computed(() => {
  if (!story.value?.chapters) {
    return [];
  }

  return story.value.chapters.flatMap((chapter, resolvedChapterIndex) =>
    (chapter.steps ?? []).map((step, resolvedStepIndex) => ({
      chapterIndex: resolvedChapterIndex,
      chapterTitle: chapter.name,
      globalStep: 0,
      stepIndex: resolvedStepIndex,
      step
    }))
  );
});
const flattenedStorySteps = computed(() => {
  let nextGlobalStep = 1;

  return flattenedSteps.value.map((entry) => ({
    ...entry,
    globalStep: nextGlobalStep++
  }));
});
const isScrollytellingStory = computed(() => story.value?.scrollytelling === true);

const currentGlobalStep = computed(() => {
  if (stage.value === 'overview' || !story.value) return 0;
  return flattenedStorySteps.value.findIndex((entry) =>
    entry.chapterIndex === chapterIndex.value && entry.stepIndex === stepIndex.value
  ) + 1;
});

// Dot-pagination for the non-scrollytelling story player.
// Uses a sliding window so the control stays compact even for longer stories.
const maxVisibleStoryDots = 7;
const visibleStoryDotIndices = computed(() => {
  const total = totalSteps.value;
  if (!total) return [];

  const currentIndex = currentGlobalStep.value - 1; // 0-based flat step index
  if (currentIndex < 0) return [];

  const windowSize = Math.min(total, maxVisibleStoryDots);
  const half = Math.floor(windowSize / 2);

  let start = Math.max(0, currentIndex - half);
  let end = Math.min(total - 1, start + windowSize - 1);

  // If we hit the end boundary, shift start so the window size stays stable.
  start = Math.max(0, end - windowSize + 1);

  const indices = [];
  for (let i = start; i <= end; i++) indices.push(i);
  return indices;
});

const currentStep = computed(() =>
  story.value?.chapters[chapterIndex.value]?.steps[stepIndex.value] ?? null
);

function syncBrowserUrl() {
  const baseUrl = `${location.origin}/portal/stories/`;

  if (!currentStoryId.value) {
    window.history.replaceState({}, '', baseUrl);
    return;
  }

  const params = new URLSearchParams({
    id: String(currentStoryId.value)
  });

  if (stage.value === 'play' && currentGlobalStep.value > 0) {
    params.set('step', String(currentGlobalStep.value));
  } else if (pendingStepFromUrl.value) {
    params.set('step', String(pendingStepFromUrl.value));
  }

  window.history.replaceState({}, '', `${baseUrl}?${params.toString()}`);
}

function getRequestedStepFromUrl() {
  return new URLSearchParams(window.location.search).get('step');
}

function setScrollStepElement(element, index) {
  scrollStepElements.value[index] = element ?? null;
}

function requestScrollToFlatStep(flatIndex, behavior = 'smooth') {
  pendingScrollTarget.value = {
    index: flatIndex,
    behavior
  };
}

async function flushPendingScrollTarget() {
  const request = pendingScrollTarget.value;

  if (!request || stage.value !== 'play' || !isScrollytellingStory.value) {
    return;
  }

  await nextTick();

  const targetElement = scrollStepElements.value[request.index];

  if (!targetElement?.scrollIntoView) {
    return;
  }

  pendingScrollTarget.value = null;
  targetElement.scrollIntoView({
    behavior: request.behavior,
    block: 'center'
  });
}

function destroyScroller() {
  scroller.value?.destroy();
  scroller.value = null;
}

async function setupScroller() {
  destroyScroller();

  if (stage.value !== 'play' || !isScrollytellingStory.value) {
    return;
  }

  await nextTick();

  const scrollContainer = scrollyRoot.value?.closest('.player-content');
  const steps = scrollStepElements.value.filter(Boolean);

  if (!scrollContainer || !steps.length) {
    return;
  }

  // Set each step's min-height to the scroll container height so scrollama can trigger correctly
  const containerHeight = scrollContainer.clientHeight;
  steps.forEach((step) => {
    step.style.minHeight = `${containerHeight}px`;
  });

  const instance = scrollama();

  instance.setup({
    step: steps,
    offset: 0.5,
    container: scrollContainer,
    root: scrollContainer
  });
  instance.onStepEnter(onScrollytellingStepEnter);
  scroller.value = instance;
}

function setActiveStepByFlatIndex(flatIndex, options = {}) {
  const {
    scroll = false,
    scrollBehavior = 'smooth'
  } = options;
  const targetStep = flattenedStorySteps.value[flatIndex];

  if (!targetStep) {
    return false;
  }

  chapterIndex.value = targetStep.chapterIndex;
  stepIndex.value = targetStep.stepIndex;
  stage.value = 'play';

  if (scroll && isScrollytellingStory.value) {
    requestScrollToFlatStep(flatIndex, scrollBehavior);
  }

  return true;
}

function openRequestedStepFromUrl() {
  const requestedStep = Number(pendingStepFromUrl.value);

  if (!Number.isInteger(requestedStep) || requestedStep < 1) {
    pendingStepFromUrl.value = null;
    stage.value = 'overview';
    chapterIndex.value = 0;
    stepIndex.value = 0;
    return;
  }

  if (!setActiveStepByFlatIndex(requestedStep - 1, {
    scroll: true,
    scrollBehavior: 'auto'
  })) {
    pendingStepFromUrl.value = null;
    stage.value = 'overview';
    chapterIndex.value = 0;
    stepIndex.value = 0;
    return;
  }

  pendingStepFromUrl.value = null;
}

async function loadStory(id) {
  if (!id) {
    story.value = null;
    isLoading.value = false;
    return;
  }
  isLoading.value = true;
  try {
    const res = await fetch(`${backendUrl}/stories/new/${id}`);
    story.value = await res.json();
    openRequestedStepFromUrl();
  } catch (error) {
    logger.error(error);
  } finally {
    isLoading.value = false;
  }
}

function resetBaseLayer() {
  setBaseLayer(defaultBaseLayerId);
}

watch(stage, (currentStage) => {
  if (currentStage === 'overview') {
    resetBaseLayer();
  }
});

watch(currentStoryId, (id) => {
  pendingStepFromUrl.value = getRequestedStepFromUrl();
  stage.value = 'overview';
  chapterIndex.value = 0;
  stepIndex.value = 0;
  loadStory(id);
}, { immediate: true });

watch(
  () => [ currentStoryId.value, stage.value, chapterIndex.value, stepIndex.value, pendingStepFromUrl.value ],
  () => {
    syncBrowserUrl();
  },
  { immediate: true }
);

watch(
  () => [ pendingScrollTarget.value?.index, stage.value, isScrollytellingStory.value, flattenedStorySteps.value.length ],
  () => {
    flushPendingScrollTarget();
  }
);

watch(
  () => [ stage.value, isScrollytellingStory.value, flattenedStorySteps.value.length ],
  () => {
    setupScroller();
  },
  { immediate: true }
);

async function load3DModel(step) {
  const models3D = Array.isArray(step.models3D) ? step.models3D : [];

  for (const model3D of models3D) {
    if (!model3D.fileUrl) continue;
    try {
      const resp = await fetch(`${backendUrl}/${model3D.fileUrl}`);
      if (!resp.ok) {
        logger.warn(`Failed to fetch model: ${resp.status}`);
        continue;
      }
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
        const modelScale = model3D.scale ?? 1;
        const modelRotation = model3D.rotation ?? 0;

        try {
          const entities = mapCollection.getMap('3D')
            ?.getDataSourceDisplay()?.defaultDataSource?.entities;
          const entity = entities?.getById(newModel.id);
          const scene = mapCollection.getMap('3D')?.getCesiumScene();

          // Hide immediately to prevent untextured-geometry blink.
          if (entity) entity.show = false;

          if (entity?.model) {
            // Enforce persisted transform values after entity creation.
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

          // Wait for Cesium to fully load the model primitive (textures included),
          // then reveal it in one clean frame — no blink.
          if (entity && scene) {
            waitForModelReady(entity, scene).then(() => {
              entity.show = model3D.show !== false;
            });
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
      }
    } catch (err) {
      logger.error('Failed to load 3D model for step:', err);
    }
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Waits until Cesium has fully loaded the model primitive for the given entity
 * (geometry + textures), then resolves. Falls back after maxWaitMs.
 * This prevents the "blink" caused by the model appearing untextured first.
 */
function waitForModelReady(entity, scene, maxWaitMs = 5000) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const removeListener = scene.postRender.addEventListener(() => {
      const primitives = scene.primitives;
      for (let i = 0; i < primitives.length; i++) {
        const prim = primitives.get(i);
        if (prim?._id === entity && prim?.ready === true) {
          removeListener();
          resolve();
          return;
        }
      }
      if (Date.now() - startTime > maxWaitMs) {
        removeListener();
        resolve();
      }
    });
  });
}

async function waitFor3DSceneReady(maxWaitMs = 600) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < maxWaitMs) {
    const scene = mapCollection.getMap('3D')?.getCesiumScene();
    if (scene?.camera) {
      return scene;
    }
    await sleep(25);
  }

  return mapCollection.getMap('3D')?.getCesiumScene() ?? null;
}

watch(
  () => [ chapterIndex.value, stepIndex.value, stage.value ],
  async () => {
    if (stage.value !== 'play' || !story.value) return;

    const step = story.value.chapters[chapterIndex.value].steps[stepIndex.value];
    if (!step) return;
    const bgId = step.backgroundMapId || defaultBaseLayerId;

    // Keep a base layer selected before the 2D/3D switch to avoid blank frames.
    setBaseLayer(bgId);

    // Clear 3D entities from the previous step
    const prevModels = store.getters['Modules/Modeler3D/importedModels'] ?? [];
    for (const model of [ ...prevModels ]) {
      store.dispatch('Modules/Modeler3D/deleteEntity', model.id);
    }

    await store.dispatch('Maps/changeMapMode', step.is3D ? '3D' : '2D');

    if (step.is3D) {
      await waitFor3DSceneReady();
      const camera = step.navigation3D?.camera;

      if (camera?.position) {
        const map3d = mapCollection.getMap('3D');
        const scene = map3d?.getCesiumScene();

        if (scene) {
          scene.camera.setView({
            destination: Cesium.Cartesian3.fromDegrees(
              camera.position[0],
              camera.position[1],
              camera.position[2]
            ),
            orientation: {
              heading: camera.heading ?? 0,
              pitch: camera.pitch ?? -Cesium.Math.PI_OVER_TWO,
              roll: camera.roll ?? 0,
            },
          });
        }
      }

      if (Array.isArray(step.models3D) && step.models3D.length > 0) {
        await load3DModel(step);
      }
    } else {
      setAnimatedView({
        center: step.centerCoordinate,
        zoom: step.zoomLevel
      });
    }

    if (Array.isArray(step.mapSources) && step.mapSources.length > 0) {
      setInformationLayers([]);
      step.mapSources.forEach(layer => {
        store.dispatch('addLayerToLayerConfig', {
          layerConfig: layer,
          parentKey: 'subjectlayer',
        });
      })
    } else {
      const allLayers = [
        ...(step.informationLayers ?? []),
        ...(Array.isArray(step.layers3D) ? step.layers3D : []),
      ];
      setBaseLayer(bgId);
      setInformationLayers(allLayers, [ bgId ]);
    }

    clearGeoJSON();
    addGeoJSON(step.geoJsonAssets);
  },
  { immediate: true }
);

const isPreviewMode = computed(() => store.state.Modules.DataNarrator.isPreviewMode);
watch(isPreviewMode, (previewEnabled) => {
  if (!previewEnabled) {
    return;
  }

  // Always start preview from the story overview.
  stage.value = 'overview';
  chapterIndex.value = 0;
  stepIndex.value = 0;
  pendingScrollTarget.value = null;
}, { immediate: true });

function backToEdit() {
  store.commit('Modules/DataNarrator/setIsPreviewMode', false);
  resetScene();
  gotoPage(dataNarratorModes.EDIT_STORY);
}

function backToDashboard() {
  resetScene();
  gotoPage(dataNarratorModes.DASHBOARD);
  setAnimatedView({
    center: initialCenter.value,
    zoom: initialZoom.value,
  });

  const baseUrl = `${location.origin}/portal/stories`;
  window.history.replaceState({}, '', `${baseUrl}/`);
}

function closeStoryPlayback() {
  if (isPreviewMode.value) {
    backToEdit();
    return;
  }

  backToDashboard();
}

function startPlay() {
  if (!story.value) return;

  if (isScrollytellingStory.value) {
    setActiveStepByFlatIndex(0, {
      scroll: true,
      scrollBehavior: 'auto'
    });
    return;
  }

  stage.value = 'play';
  chapterIndex.value = 0;
  stepIndex.value = 0;
}

function next() {
  if (!story.value) return;

  if (isScrollytellingStory.value) {
    const nextFlatIndex = currentGlobalStep.value;

    if (nextFlatIndex < flattenedStorySteps.value.length) {
      setActiveStepByFlatIndex(nextFlatIndex, { scroll: true });
    } else {
      closeStoryPlayback();
    }
    return;
  }

  const steps = story.value.chapters[chapterIndex.value].steps;
  if (stepIndex.value < steps.length - 1) {
    stepIndex.value++;
  } else if (chapterIndex.value < story.value.chapters.length - 1) {
    chapterIndex.value++;
    stepIndex.value = 0;
  } else {
    resetScene();
    stage.value = 'overview';
    setAnimatedView({
      center: initialCenter.value,
      zoom: initialZoom.value,
    });
  }
}

function back() {
  if (!story.value) return;

  if (stage.value === 'overview') return;
  if (isScrollytellingStory.value) {
    const previousFlatIndex = currentGlobalStep.value - 2;

    if (previousFlatIndex >= 0) {
      setActiveStepByFlatIndex(previousFlatIndex, { scroll: true });
    } else {
      resetScene();
      stage.value = 'overview';
      setAnimatedView({
        center: initialCenter.value,
        zoom: initialZoom.value,
      });
    }
    return;
  }
  if (stepIndex.value > 0) {
    stepIndex.value--;
  } else if (chapterIndex.value > 0) {
    chapterIndex.value--;
    stepIndex.value = story.value.chapters[chapterIndex.value].steps.length - 1;
  } else {
    resetScene();
    stage.value = 'overview';
    setAnimatedView({
      center: initialCenter.value,
      zoom: initialZoom.value,
    });
  }
}

function startFromChapter(idx) {
  if (!story.value) return;
  const chapter = story.value.chapters?.[idx];
  if (!chapter || !chapter.steps?.length) return;
  if (isScrollytellingStory.value) {
    const flatIndex = flattenedStorySteps.value.findIndex((entry) => entry.chapterIndex === idx);

    if (flatIndex >= 0) {
      setActiveStepByFlatIndex(flatIndex, {
        scroll: true,
        scrollBehavior: 'auto'
      });
    }
    return;
  }
  chapterIndex.value = idx;
  stepIndex.value = 0;
  stage.value = 'play';
}

function onScrollytellingStepEnter({ index }) {
  if (stage.value !== 'play' || !isScrollytellingStory.value) {
    return;
  }

  setActiveStepByFlatIndex(index);
}

function goToScrollytellingStep(globalStep) {
  if (!isScrollytellingStory.value) {
    return;
  }

  setActiveStepByFlatIndex(globalStep - 1, { scroll: true });
}

function goToPreviousScrollytellingStep(globalStep) {
  if (globalStep <= 1) {
    return;
  }

  goToScrollytellingStep(globalStep - 1);
}

function goToNextScrollytellingStep(globalStep) {
  if (globalStep >= flattenedStorySteps.value.length) {
    closeStoryPlayback();
    return;
  }

  goToScrollytellingStep(globalStep + 1);
}

onBeforeUnmount(() => {
  destroyScroller();
  removeAllVisibleLayers();
  resetBaseLayer();
});
</script>

<template>
  <ToolWindow>
    <template #fixed>
      <PlayerFrame
        :title="story?.title ?? ''"
        :is-preview="isPreviewMode"
        :show-header="false"
        :player-width="story?.playerWidth ?? null"
        :player-height="story?.playerHeight ?? null"
        @back="backToDashboard"
        @leave-preview="backToEdit"
      >
        <template #default>
          <div v-if="isLoading">
            Loading...
          </div>

          <div v-else>
            <div v-if="stage === 'overview'">
              <div class="story-overview-step px-2 pb-4">
                <v-btn
                  :icon="mdiClose"
                  variant="flat"
                  size="small"
                  class="story-play-close"
                  @click="closeConfirmation = true"
                />

                <div
                  v-if="story.titleImage"
                  class="story-cover mb-2"
                  :style="`background-image: url(${getFileUrl(story.titleImage)});`"
                />
                <h5 class="story-title font-bold mb-2">
                  {{ story.title }}
                </h5>
                <div class="story-description mb-2">
                  {{ story.description }}
                </div>

                <ul class="chapter-list">
                  <li
                    v-for="(chapter, index) in story.chapters"
                    :key="chapter.id"
                    class="chapter"
                    @click="startFromChapter(index)"
                  >
                    <div class="chapter-label">
                      {{ numberToLetter(index + 1) }}
                    </div>
                    <div class="chapter-title">
                      {{ chapter.name }}
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <div v-else>
              <div
                v-if="isScrollytellingStory"
                ref="scrollyRoot"
                class="scrolly-steps"
              >
                <section
                  v-for="entry in flattenedStorySteps"
                  :key="`${entry.chapterIndex}-${entry.stepIndex}-${entry.globalStep}`"
                  :ref="(element) => setScrollStepElement(element, entry.globalStep - 1)"
                  :data-step="entry.globalStep"
                  :class="['scrolly-step', { active: entry.globalStep === currentGlobalStep }]"
                >
                  <div class="chapter px-2">
                    <div
                      class="chapter-label"
                      :style="{ backgroundColor: getStoryColor(entry.chapterIndex).primary }"
                    >
                      {{ numberToLetter(entry.chapterIndex + 1) }}
                    </div>
                    <div class="chapter-title">
                      {{ entry.chapterTitle }}
                    </div>
                  </div>
                  <div class="step-content px-2 pb-4">
                    <div class="step-content-title mt-3">
                      <h2
                        class="step-pill"
                        :style="{ borderColor: getStoryColor(entry.chapterIndex).primary, color: getStoryColor(entry.chapterIndex).primary }"
                      >
                        {{ entry.stepIndex + 1 }}
                      </h2>
                      <h3 class="font-bold">
                        {{ entry.step.title }}
                      </h3>
                    </div>
                    <div class="mt-4">
                      <RichTextViewer v-model="entry.step.html" />
                    </div>
                  </div>
                  <div class="scrolly-step-controls">
                    <v-btn
                      variant="text"
                      rounded
                      :icon="mdiChevronLeft"
                      :disabled="entry.globalStep === 1"
                      @click.prevent="goToPreviousScrollytellingStep(entry.globalStep)"
                    />
                    <v-btn
                      variant="text"
                      rounded
                      :icon="mdiClose"
                      @click.prevent="closeStoryPlayback"
                    />
                    <v-btn
                      variant="text"
                      rounded
                      :icon="mdiChevronRight"
                      @click.prevent="goToNextScrollytellingStep(entry.globalStep)"
                    />
                  </div>
                </section>
              </div>

              <template v-else>
                <div class="story-play-step px-2 pb-4">
                  <v-btn
                    :icon="mdiClose"
                    variant="flat"
                    size="small"
                    class="story-play-close"
                    @click="closeConfirmation = true"
                  />

                  <div class="story-play-chapter-header">
                    <span class="story-play-chapter-badge">
                      {{ numberToLetter(chapterIndex + 1) }}
                    </span>
                    <span class="story-play-chapter-name">
                      {{ story.chapters[chapterIndex].name }}
                    </span>
                  </div>

                  <h3 class="story-play-step-title">
                    {{ story.chapters[chapterIndex].steps[stepIndex].title }}
                  </h3>

                  <div class="mt-4 story-play-text">
                    <RichTextViewer v-model="story.chapters[chapterIndex].steps[stepIndex].html" />
                  </div>
                </div>
              </template>
            </div>
          </div>
        </template>

        <template #footer>
          <div
            v-if="stage === 'overview'"
            class="nav-bar"
          >
            <v-btn
              variant="flat"
              color="#555"
              rounded
              :loading="isLoading"
              @click="startPlay"
            >
              Start
            </v-btn>
          </div>

          <div
            v-else-if="stage === 'play' && (!isScrollytellingStory)"
            class="nav-bar story-play-nav-bar"
          >
            <v-btn
              :icon="mdiChevronLeft"
              variant="flat"
              size="small"
              class="nav-btn"
              @click="back"
            />

            <div class="story-play-dots">
              <button
                v-for="flatDotIndex in visibleStoryDotIndices"
                :key="flatDotIndex"
                type="button"
                class="story-play-dot"
                :class="{ active: flatDotIndex === currentGlobalStep - 1 }"
                :style="{
                  backgroundColor: flatDotIndex === currentGlobalStep - 1
                    ? getStoryColor(flattenedStorySteps[flatDotIndex]?.chapterIndex ?? 0).primary
                    : 'rgba(31,41,55,0.25)'
                }"
                @click="setActiveStepByFlatIndex(flatDotIndex)"
              />
            </div>

            <v-btn
              :icon="mdiChevronRight"
              variant="flat"
              size="small"
              class="nav-btn"
              @click="next"
            />
          </div>
        </template>
      </PlayerFrame>
    </template>
  </ToolWindow>
  <ConfirmationDialog
    v-model="closeConfirmation"
    :title="t('additional:modules.dataNarrator.confirm.leaveStory.title')"
    :message="t('additional:modules.dataNarrator.confirm.leaveStory.description')"
    :cancel-text="t('additional:modules.dataNarrator.confirm.leaveStory.denyButton')"
    :confirm-text="t('additional:modules.dataNarrator.confirm.leaveStory.confirmButton')"
    @confirm="closeStoryPlayback"
  />
  <ThreeDHint :visible="!isMobile && stage === 'play' && !!currentStep?.is3D" />
</template>

<style lang="scss" scoped>
.story-cover {
  width: 100%;
  height: 180px;
  aspect-ratio: 16 / 9;
  background-color: #f1f1f1;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  border-radius: 5px;
}

.story-title {
  font-size: 15pt;
}

.story-description {
  font-size: 14px;
}

.chapter-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-left: 0;
}

.chapter {
  display: flex;
  align-items: center;
  gap: 6px;
  border-radius: 50px;
  padding: 4px 8px;
  cursor: pointer;

  &-label {
    padding: 2px 16px;
    border-radius: 20px;
    font-size: 16px;
    font-weight: bold;
    color: #374151;
    border: 1px solid #d1d5db;
    background: transparent;
  }

  &-title {
    flex: 1;
    font-weight: bold;
    font-size: 15pt;
  }
}

.step-content {
  &-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 15pt;

    .step-pill {
      border: 2px solid currentColor;
      padding: 10px;
      border-radius: 20px;
    }
  }
}

.scrolly-steps {
  display: flex;
  flex-direction: column;
  padding: 0 0 16px;
}

.scrolly-step {
  min-height: 100%;
  padding-bottom: 8px;
  display: flex;
  flex-direction: column;

  &.active {
    .step-pill {
      background-color: rgba(34, 96, 81, 0.08);
    }
  }
}

.scrolly-step-controls {
  display: flex;
  justify-content: center;
  gap: 8px;
  width: fit-content;
  margin: 16px auto 0;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(246, 246, 246, 0.78);
  backdrop-filter: blur(6px);
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 6px 16px;
  border-radius: 999px;
  background: white;
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
}

.nav-btn {
  width: 36px;
  height: 36px;
  min-width: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9) !important;
  color: #1f2937 !important;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.nav-step-info {
  font-size: 13px;
  font-weight: 600;
  color: #1f2937;
  min-width: 40px;
  text-align: center;
}

.story-play-step {
  position: relative;
}

.story-overview-step {
  position: relative;
}

.story-play-close {
  position: absolute;
  top: 2px;
  right: 2px;
}

.story-play-chapter-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.story-play-chapter-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 28px;
  padding: 0 14px;
  border-radius: 999px;
  color: #374151;
  border: 1px solid #d1d5db;
  background: transparent;
  font-weight: 700;
  font-size: 15px;
}

.story-play-chapter-name {
  font-size: 24px;
  font-weight: 500;
  line-height: 1.15;
}

.story-play-step-title {
  margin-top: 14px;
  font-size: 34px;
  font-weight: 800;
  line-height: 1.1;
}

.story-play-text {
  font-size: 14px;
}

.story-play-nav-bar {
  gap: 8px;
}

.story-play-dots {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 2px 6px;
}

.story-play-dot {
  width: 8px;
  height: 8px;
  min-width: 8px;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  transition: transform 120ms ease;
}

.story-play-dot.active {
  transform: scale(1.15);
}
</style>
