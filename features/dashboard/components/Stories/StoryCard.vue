<script setup>
import { computed } from 'vue';

import { useStore } from 'vuex';

import { useDataNarrator } from '../../../../hooks/useDataNarrator';
import { backendUrl, dataNarratorModes } from '../../../../store/contantsDataNarrator';
import { createLogger } from '../../../../utils/logger.js';
import { useStory } from '../../../stories/hooks/useStory';
import { useLogin } from '../../hooks/useLogin';

import AuthorDisplay from './Author.vue';
import DeleteButton from './DeleteButton.vue';
import EditButton from './EditButton.vue';
import FeaturedButton from './FeaturedButton.vue';
import PlayButton from './PlayButton.vue';
import PublishButton from './PublishButton.vue';
import ShareButton from './ShareButton.vue';

const store = useStore();
const storiesDisplayMode = computed(() => {
  return store.state.Modules.DataNarrator.DashboardStore.mode
});

const { userId, isAdmin } = useLogin();
const { gotoPage } = useDataNarrator();
const { currentStoryId } = useStory();
const emit = defineEmits([ 'deleted', 'published' ]);

const logger = createLogger('StoryCard.vue');

const props = defineProps({
  story: {
    type: Object,
    required: true
  },
  shareSettings: {
    type: Boolean,
    default: false
  },
});

function getFileUrl(titleImage) {
  return `${backendUrl}/files/${titleImage.fileContext}/${titleImage.filename}`;
}

async function playStory() {
  // count a view
  try {
    await fetch(`${backendUrl}/stories/${props.story.id}/play`, {
      method: 'POST'
    });
  } catch (error) {
    logger.error('Error counting story view:', error);
  }

  currentStoryId.value = props.story.id;
  gotoPage(dataNarratorModes.PLAY_STORY);

  const baseUrl = `${location.origin}/portal/stories/?id=${props.story.id}`;
  window.history.replaceState({}, '', baseUrl);
}

</script>

<template>
  <v-card
    class="story-card"
    variant="flat"
  >
    <div
      v-if="story.titleImage"
      class="story-card-cover"
      :style="`background-image: url(${getFileUrl(story.titleImage)});`"
    />

    <div class="card-header">
      <div class="card-header-title">
        <div class="card-header-title-text">
          {{ story.title }}
        </div>
        <AuthorDisplay :author-id="story.author" />
      </div>

      <div class="card-header-actions">
        <ShareButton
          :story-id="story.id"
        />
        <template v-if="isAdmin">
          <FeaturedButton
            :story-id="story.id"
            :is-featured="story.featured"
          />
        </template>
        <PublishButton
          v-if="storiesDisplayMode === 'my' && userId === story.owner"
          :is-draft="story.isDraft"
          :story-id="story.id"
          @success="() => emit('published')"
        />
      </div>
    </div>

    <v-card-text class="card-text">
      {{ story.description }}
    </v-card-text>

    <v-card-actions class="card-actions">
      <v-row>
        <v-col>
          <EditButton
            v-if="userId === story.owner || isAdmin"
            :story-id="story.id"
          />
          <DeleteButton
            v-if="userId === story.owner || isAdmin"
            :story-id="story.id"
            @deleted="() => emit('deleted')"
          />
        </v-col>
        <v-col class="play-button">
          <PlayButton
            :story-id="story._id"
            @click="playStory"
          />
        </v-col>
      </v-row>
    </v-card-actions>
  </v-card>
</template>

<style lang="scss" scoped>
.story-card {
    border: 1px solid rgba(0, 0, 0, 0.40);
    border-radius: 5px;

    &-cover {
        width: 100%;
        height: 180px;
        aspect-ratio: 16 / 9;
        background-color: #f1f1f1;
        background-position: center;
        background-repeat: no-repeat;
        background-size: cover;
        border-radius: 5px;
    }
}

.card-header {
  padding: 10px 12px 8px 12px;
  display: flex;
  align-items: flex-start;

  .card-header-title {
      flex: 1;

      &-text {
          font-weight: bold;
          text-transform: capitalize;
          font-size: 18px;
      }
  }

  .card-header-actions {
      display: flex;
      align-items: center;
  }
}

.card-text {
  padding: 0 12px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 4;
  line-clamp: 4;
  overflow: hidden;
  white-space: normal;
  overflow-wrap: anywhere;
  color: #4c4c4c;
}


.card-actions {
    padding: 0;
}

.play-button {
    justify-content: end;
    display: flex;
}
</style>
