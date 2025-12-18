import { ref } from 'vue';

import { backendUrl } from '../../../store/contantsDataNarrator';

export function useFetchStories () {
  const stories = ref([]);
  const error = ref(null);
  const loading = ref(false);

  // Non-reactive fetch function that takes mode as a parameter
  const fetchStories = async (mode) => {
    // Reset state before fetching
    loading.value = true;
    stories.value = [];
    error.value = null;

    const url = `${backendUrl}/stories/${mode}`;

    try {
      const response = await fetch(url);
      stories.value = await response.json();
    } catch (err) {
      error.value = err;
    } finally {
      loading.value = false;
    }
  };

  return {
    stories,
    error,
    loading,
    fetchStories // Expose the fetch function
  };
}
