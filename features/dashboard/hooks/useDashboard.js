import {computed, customRef, ref, toValue, watch} from "vue";
import {availableStoryListModes, backendUrl} from "../../../store/contantsDataNarrator";
import {useDashboardStore} from "../store/useDashboardStore";
import {useFetch} from "../../../composables/useFetch";
import {storeToRefs} from "pinia";

/**
 *
 */
export function useDashboard () {

    const dashboardStore = useDashboardStore();
    const {mode:storiesDisplayMode} = storeToRefs(dashboardStore);

    const url = ref(`${backendUrl}/stories/${storiesDisplayMode.value}`);

    // Watch for changes to the mode ref and log them
    watch(storiesDisplayMode, (newValue, oldValue) => {
        console.log(`Url changed from '${oldValue}' to '${newValue}'`);
        url.value = `${backendUrl}/stories/${newValue}`;
    });

    const {data: stories, error, loading} = useFetch(url, null, "FETCH_STORIES");

    return {
        open,
        stories,
        error,
        loading,
        storiesDisplayMode,
        availableStoryListModes,
    };
}
