<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { useStore } from 'vuex';

import { useDataNarrator } from '../../../../hooks/useDataNarrator';
import { backendUrl, dataNarratorModes } from '../../../../store/contantsDataNarrator';
import { getFileUrl } from '../../../../utils/getFileUrl';
import ToolWindow from '../../../shared/Toolwindow/ToolWindow.vue';
import { useNavigation } from '../../../steps/hooks/useNavigation';
import { useStory } from '../../hooks/useStory';

import PlayerFrame from './play/PlayerFrame.vue';
import RichTextViewer from './step/RichTextViewer.vue';

const { gotoPage } = useDataNarrator()
const { currentStoryId } = useStory();
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

async function loadStory(id) {
  if (!id) return;
  isLoading.value = true;
  try {
    const res = await fetch(`${backendUrl}/stories/new/${id}`);
    story.value = await res.json();
  } catch (error) {
    console.error(error);
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

watch(
  () => [ chapterIndex.value, stepIndex.value, stage.value ],
  () => {
    if (stage.value !== 'play' || !story.value) return;

    const step = story.value.chapters[chapterIndex.value].steps[stepIndex.value];
    if (!step) return;

    setAnimatedView({
      center: step.centerCoordinate,
      zoom: step.zoomLevel
    });

    if (step.mapSources.length > 0) {
      step.mapSources.forEach(layer => {
        store.dispatch('addLayerToLayerConfig', {
          layerConfig: layer,
          parentKey: 'subjectlayer', // analogue to AddWMS in MP
        });
      })
    } else {
      const bgId = step.backgroundMapId || defaultBaseLayerId;
      setBaseLayer(bgId);
      setInformationLayers(step.informationLayerIds ?? [], [ bgId ]);
    }
  },
  { immediate: true }
);

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
    gotoPage(dataNarratorModes.DASHBOARD);
    removeAllVisibleLayers();
    resetBaseLayer();
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
      <PlayerFrame :title="stage === 'play' ? story.title : undefined">
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
                    {{ index + 1 }}
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
                  {{ chapterIndex + 1 }}
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
