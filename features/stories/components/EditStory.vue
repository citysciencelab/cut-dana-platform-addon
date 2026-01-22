<script setup>
import { onMounted, ref, watch } from 'vue';

import { backendUrl } from '../../../store/contantsDataNarrator';
import { createLogger } from '../../../utils/logger.js';
import ToolWindow from '../../shared/Toolwindow/ToolWindow.vue';

import { useStory } from '../hooks/useStory';
import { getStory } from '../services/getStory';

import StoryForm from './StoryForm.vue';

const logger = createLogger('EditStory.vue');
const { currentStoryId } = useStory();

const isLoading = ref(false);
const storyName = ref('');
const description = ref('');
const chapters = ref([]);
const coverImageUrl = ref(null);

function getFileUrl(titleImage) {
  return `${backendUrl}/files/${titleImage.fileContext}/${titleImage.filename}`;
}

async function loadStory() {
  if (!currentStoryId?.value) return;

  isLoading.value = true;

  try {
    const data = await getStory(currentStoryId.value);
    storyName.value = data.title ?? '';
    description.value = data.description ?? '';
    coverImageUrl.value = data.titleImage ? getFileUrl(data.titleImage) : null;
    chapters.value = (data.chapters ?? []).map((c, idx) => ({
      id: idx,
      sequence: c.sequence,
      title: c.name,
      steps: (c.steps ?? []).map((s, i) => ({
        id: i + 1,
        title: s.title,
        description: s.html,
        mapConfig: {
          centerCoordinates: s.centerCoordinate,
          zoomLevel: s.zoomLevel,
          backgroundMapId: s.backgroundMapId,
        },
        informationLayers: s.informationLayers,
        geoJsonAssets: s.geoJsonAssets,
        mapSources: s.mapSources
      })),
    }));
  } catch (err) {
    logger.error(err);
  } finally {
    isLoading.value = false;
  }
}

onMounted(loadStory);
watch(() => currentStoryId?.value, loadStory);
</script>

<template>
  <ToolWindow>
    <template #fixed>
      <StoryForm
        :story-id="currentStoryId"
        :chapters="chapters"
        :story-name="storyName"
        :description="description"
        :story-loading="isLoading"
        :cover-image-url="coverImageUrl"
      />
    </template>
  </ToolWindow>
</template>
