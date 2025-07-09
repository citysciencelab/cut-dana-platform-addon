import {watch} from "vue";
import {availableStoryListModes} from "../../../store/contantsDataNarrator";
import {useDashboardStore} from "../store/useDashboardStore";
import {storeToRefs} from "pinia";
import {useFetchStories} from "../../../composables/services/stories/useGetStories";

/**
 *
 */
export function useDashboard () {
    const dashboardStore = useDashboardStore();
    const {mode: storiesDisplayMode, open} = storeToRefs(dashboardStore);

    // Initialize the fetch composable
    const {stories, error, loading, fetchStories} = useFetchStories();

    // Initial fetch on component initialization
    fetchStories(storiesDisplayMode.value);

    // Watch for mode changes and manually trigger fetch
    watch(storiesDisplayMode, (newMode) => {
        console.elie(`Dashboard mode changed to ${newMode}, triggering fetch`);
        fetchStories(newMode);
    });

    return {
        stories,
        error,
        loading,
        storiesDisplayMode,
        availableStoryListModes,
        open
    };
}
