import { computed } from 'vue';
import { useStore } from 'vuex';

export function useStory () {
  const store = useStore();

  const currentStoryId = computed({
    get() {
      return store.state.Modules.DataNarrator.StoryStore.selectedStoryId;
    },
    set(id) {
      store.commit('Modules/DataNarrator/StoryStore/setSelectedStoryId', id);
    }
  });

  return {
    currentStoryId
  };
}
