import { storeToRefs } from 'pinia';
import { watch, computed } from 'vue';

import { useFetchStories } from '../../../composables/services/stories/useGetStories';
import { availableStoryListModes } from '../../../store/contantsDataNarrator';
import { useDashboardStore } from '../store/useDashboardStore';

import { useLogin } from './useLogin';

/**
 * Dashboard composable for managing stories display and fetching
 */
export function useDashboard () {
  const { loggedIn } = useLogin()
  const dashboardStore = useDashboardStore();
  const { mode: storiesDisplayMode, open } = storeToRefs(dashboardStore);

  // Initialize the fetch composable
  const { stories, error, loading, fetchStories } = useFetchStories();

  const setOpen = () => {
    open.value = !open.value;
  }

  const refetchStories = () => {
    fetchStories(storiesDisplayMode.value);
  }

  // Watch for mode changes and fetch stories
  // immediate:  true replaces the separate initial fetch call
  watch(
    storiesDisplayMode,
    (newMode) => {
      fetchStories(newMode);
    },
    { immediate: true }
  );

  const storyModeLists = computed(() => {
    return Object.values(availableStoryListModes).filter(mode =>
      loggedIn.value || mode !== 'my'
    );
  });

  return {
    stories,
    error,
    loading,
    storiesDisplayMode,
    storyModeLists,
    open,
    setOpen,
    refetchStories
  };
}
