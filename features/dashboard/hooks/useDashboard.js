import {ref} from "vue";
import {getStories} from "../services/getStories";
import {availableStoryListModes} from "../../../store/contantsDataNarrator";
import {defineStore} from "pinia";


export const useDashboard = defineStore('dashboard',() => {
    const storiesDisplayMode = ref('all');
    const stories = ref([]);
    const isOpen = ref(true);

    const getAllStories = async () => {
        const response = await getStories(storiesDisplayMode.value);
        stories.value = await response.json();
    };

    const refetchStories = async (mode) => {
        storiesDisplayMode.value = mode;
        await getAllStories();
    }

    return {
        storiesDisplayMode,
        stories,
        isOpen,
        availableStoryListModes,

        getAllStories,
        refetchStories
    }
});
