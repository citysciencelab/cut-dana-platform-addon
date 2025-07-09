import {backendUrl} from "../../../store/contantsDataNarrator";
import {ref} from "vue";
// useFetchStories.js

export function useFetchStories () {
    const stories = ref(null);
    const error = ref(null);
    const loading = ref(false);

    // Non-reactive fetch function that takes mode as a parameter
    const fetchStories = async (mode) => {
        // Reset state before fetching
        loading.value = true;
        stories.value = null;
        error.value = null;

        const url = `${backendUrl}/stories/${mode}`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            stories.value = data;
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
