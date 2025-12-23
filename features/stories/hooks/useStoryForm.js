import { customRef, ref } from 'vue';
import { useStore } from 'vuex';

import { backendUrl } from '../../../store/contantsDataNarrator';
import { isNullOrWhitespace } from '../../../utils/stringUtils';
import { uploadCoverImage } from '../services/addCoverImage';
import { createChapter } from '../services/chapters';

export function useStoryForm() {
  const store = useStore();

  const chapterName = ref('');

  const updateStory = async () => {
    await createDraftStory();

    const storyState = store.state.Modules.DataNarrator.EditStoryForm;

    const story = {
      title: storyState.storyTitle,
      description: storyState.storyDescription,
    }

    if (isValidStory(story)) {
      await fetch(`${backendUrl}/stories/${storyState.selectedStoryId}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...story
        })
      });
    }
  }
  const createDraftStory = async () => {
    const response = await fetch(`${backendUrl}/stories/draft`, {
      method: 'POST'
    });
    if (response.ok) {
      const storyId = await response.json();
      store.commit('Modules/DataNarrator/EditStoryForm/setSelectedStoryId', storyId)
    }
  }
  const isValidStory = (story) => {
    return !isNullOrWhitespace(story.title) && !isNullOrWhitespace(story.description)
  }

  const title = customRef((track, trigger) => {
    return {
      get() {
        track()
        return store.state.Modules.DataNarrator.EditStoryForm.storyTitle
      },
      set(newValue) {
        store.commit('Modules/DataNarrator/EditStoryForm/setStoryTitle', newValue)
        trigger()
      }
    }
  })
  const description = customRef((track, trigger) => {
    return {
      get() {
        track()
        return store.state.Modules.DataNarrator.EditStoryForm.storyDescription
      },
      set(newValue) {
        store.commit('Modules/DataNarrator/EditStoryForm/setStoryDescription', newValue)
        trigger()
      }
    }
  });
  const chapters = customRef((track, trigger) => {
    return {
      get() {
        track()
        return store.state.Modules.DataNarrator.EditStoryForm.storyChapters
      },
      set(newValue) {
        store.commit('Modules/DataNarrator/EditStoryForm/setStoryChapters', newValue)
        trigger()
      }
    }
  })
  const storyId = customRef((track, trigger) => {
    return {
      get() {
        track()
        return store.state.Modules.DataNarrator.EditStoryForm.selectedStoryId
      },
      set(newValue) {
        store.commit('Modules/DataNarrator/EditStoryForm/setSelectedStoryId', newValue)
        trigger()
      }
    }
  })

  const fetchStory = async () => {
    if (storyId.value) {
      const response = await fetch(`${backendUrl}/stories/${storyId.value}`);
      if (response.ok) {
        const storyData = await response.json();
        const newStory = {
          title: storyData.title,
          description: storyData.description,
          chapters: storyData.chapters
        }
        store.commit('Modules/DataNarrator/EditStoryForm/setStoryData', newStory);
      }
    }
  };

  const addChapter = async () => {
    const newChapter = {
      name: chapterName.value,
      sequence: chapters.value.length
    }

    const response = await createChapter(storyId.value, newChapter);

    if (response.ok) {
      chapters.value.push(newChapter);
    }

    // send chapter to server, if success add to chapters
  }
  const deleteStory = async (toDeleteStoryId) => {
    const response = await fetch(`${backendUrl}/stories/${toDeleteStoryId}`, {
      method: 'DELETE'
    });
    if (response.ok) {
      store.dispatch('Modules/DataNarrator/StoryStore/fetchStories', 'all');
    }
  }

  const uploadCover = async (file) => {
    const response = await uploadCoverImage(storyId.value, file);

    if (response.ok) {
      const coverUrl = await response.json();
      console.log(coverUrl);
      store.commit('Modules/DataNarrator/EditStoryForm/setCoverUrl', coverUrl);
    }
  }

  return {
    title,
    description,
    chapters,
    storyId,
    chapterName,
    createStory,
    updateStory,
    createDraftStory,
    fetchStory,
    addChapter,
    deleteStory,
    uploadCover
  }
}
