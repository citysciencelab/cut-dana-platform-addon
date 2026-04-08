<script setup>
import { useTranslation } from 'i18next-vue';
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { useStore } from 'vuex';

import { useDataNarrator } from '../../../hooks/useDataNarrator';
import { useIsMobile } from '../../../hooks/useIsMobile';
import { useSceneReset } from '../../../hooks/useSceneReset';
import { backendUrl, dataNarratorModes } from '../../../store/contantsDataNarrator';
import ToolWindow from '../../shared/Toolwindow/ToolWindow.vue';
import { useNavigation } from '../../steps/hooks/useNavigation';
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

const totalSteps = computed(() => {
  if (!story.value) return 0;
  return story.value.chapters.reduce(
    (sum, chap) => sum + chap.steps.length,
    0
  );
});

const currentGlobalStep = computed(() => {
  if (stage.value === 'overview' || !story.value) return 0;

  const prevSteps = story.value.chapters
    .slice(0, chapterIndex.value)
    .reduce((sum, chap) => sum + chap.steps.length, 0);

  return prevSteps + stepIndex.value + 1;
});

const currentStep = computed(() =>
  story.value?.chapters[chapterIndex.value]?.steps[stepIndex.value] ?? null
);

async function loadStory(id) {
  if (!id) return;
  isLoading.value = true;
  try {
    const res = await fetch(`${backendUrl}/stories/new/${id}`);
    story.value = await res.json();
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
  loadStory(id);
  stage.value = 'overview';
  chapterIndex.value = 0;
  stepIndex.value = 0;
}, { immediate: true });

async function load3DModel(step) {
  const models3D = Array.isArray(step.models3D) ? step.models3D : [];

  for (const model3D of models3D) {
    if (!model3D.fileUrl) continue;
    try {
      const resp = await fetch(`${backendUrl}/${model3D.fileUrl}`);
      if (!resp.ok) {
        console.warn(`Failed to fetch model: ${resp.status}`);
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
        } catch { /* ignore */ }

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
    for (const model of [...prevModels]) {
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
      setBaseLayer(bgId);
      setInformationLayers(step.informationLayers ?? [], [ bgId ]);
    }

    clearGeoJSON();
    addGeoJSON(step.geoJsonAssets);
  },
  { immediate: true }
);

const isPreviewMode = computed(() => store.state.Modules.DataNarrator.isPreviewMode);

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
  window.history.replaceState({}, '', baseUrl);
}

function startPlay() {
  stage.value = 'play';
  chapterIndex.value = 0;
  stepIndex.value = 0;
}

function next() {
  if (!story.value) return;

  const steps = story.value.chapters[chapterIndex.value].steps;
  if (stepIndex.value < steps.length - 1) {
    stepIndex.value++;
  } else if (chapterIndex.value < story.value.chapters.length - 1) {
    chapterIndex.value++;
    stepIndex.value = 0;
  } else {
    resetScene();
    gotoPage(dataNarratorModes.DASHBOARD);
    setAnimatedView({
      center: initialCenter.value,
      zoom: initialZoom.value,
    });
  }
}

function back() {
  if (!story.value) return;

  if (stage.value === 'overview') return;
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
  chapterIndex.value = idx;
  stepIndex.value = 0;
  stage.value = 'play';
}

onBeforeUnmount(() => {
  removeAllVisibleLayers();
  resetBaseLayer();
});
</script>

<template>
  <ToolWindow>
    <template #fixed>
      <PlayerFrame
        :title="stage === 'play' ? story.title : t('additional:modules.dataNarrator.play.storyOverviewTitle')"
        :is-preview="isPreviewMode"
        @back="backToDashboard"
        @leave-preview="backToEdit"
      >
        <template #default>
          <div v-if="isLoading">
            Loading...
          </div>

          <div v-else>
            <div v-if="stage === 'overview'">
              <div
                v-if="story.titleImage"
                class="story-cover mb-2"
                :style="`background-image: url(${getFileUrl(story.titleImage)});`"
              />
              <h5 class="story-title px-2 font-bold mb-2">
                {{ story.title }}
              </h5>
              <div class="story-description px-2 mb-2">
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

            <div v-else>
              <div class="chapter px-2">
                <div class="chapter-label">
                  {{ numberToLetter(chapterIndex + 1) }}
                </div>
                <div class="chapter-title">
                  {{ story.chapters[chapterIndex].name }}
                </div>
              </div>
              <div class="step-content px-2">
                <div class="step-content-title mt-10">
                  <h2 class="step-pill">
                    {{ stepIndex + 1 }}
                  </h2>
                  <h3 class="font-bold">
                    {{ story.chapters[chapterIndex].steps[stepIndex].title }}
                  </h3>
                </div>
                <div class="mt-4">
                  <RichTextViewer v-model="story.chapters[chapterIndex].steps[stepIndex].html" />
                </div>
              </div>
            </div>
          </div>
        </template>

        <template #footer>
          <v-row align="center">
            <div>{{ currentGlobalStep }}/{{ totalSteps }}</div>

            <v-col class="p-0">
              <v-row justify="end">
                <v-btn
                  v-if="stage === 'play'"
                  variant="text"
                  rounded
                  @click="back"
                >
                  Zurück
                </v-btn>
                <v-btn
                  v-if="stage === 'overview'"
                  class="ml-2"
                  variant="flat"
                  color="black"
                  rounded
                  :loading="isLoading"
                  @click="startPlay"
                >
                  Start
                </v-btn>
                <v-btn
                  v-else
                  class="ml-2"
                  variant="flat"
                  color="black"
                  rounded
                  @click="next"
                >
                  {{ totalSteps === currentGlobalStep ? 'Beenden' : 'Weiter' }}
                </v-btn>
              </v-row>
            </v-col>
          </v-row>
        </template>
      </PlayerFrame>
    </template>
  </ToolWindow>
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
    font-size: 20px;
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
        background-color: #413fab;
        padding: 2px 16px;
        border-radius: 20px;
        font-size: 16px;
        font-weight: bold;
        color: white;
    }

    &-title {
        flex: 1;
        font-weight: bold;
    }
}

.step-content {
    &-title {
        display: flex;
        align-items: center;
        gap: 8px;

        .step-pill {
            border: 2px solid #226051;
            padding: 10px;
            border-radius: 20px;
        }
    }
}
</style>
