import {watch, computed} from "vue";
import {storeToRefs} from "pinia";

import {availableStoryListModes} from "../../../store/contantsDataNarrator";
import {useDashboardStore} from "../store/useDashboardStore";
import {useFetchStories} from "../../../composables/services/stories/useGetStories";
import {useLogin} from "./useLogin";

/**
 *
 */
export function useDashboard () {
    const {loggedIn} = useLogin()
    const dashboardStore = useDashboardStore();
    const {mode: storiesDisplayMode, open} = storeToRefs(dashboardStore);

    // Initialize the fetch composable
    const {stories, error, loading, fetchStories} = useFetchStories();

    const setOpen = () => {
        open.value = !open.value;
    }

    // Initial fetch on component initialization
    fetchStories(storiesDisplayMode.value);

    // Watch for mode changes and manually trigger fetch
    watch(storiesDisplayMode, (newMode) => {
        console.elie(`Dashboard mode changed to ${newMode}, triggering fetch`);
        fetchStories(newMode);
    });

    const storyModeLists = computed(() => {
        return Object.values(availableStoryListModes).filter(mode =>
            loggedIn.value || mode !== "my"
        );
    });

    return {
        stories,
        error,
        loading,
        storiesDisplayMode,
        storyModeLists,
        open,
        setOpen
    };
}
