import {ref} from "vue";
import {useStoryForm} from "./useStoryForm";
import {useStore} from "vuex";

/**
 *
 */
export function useStories () {
    const currentStoryId = ref("");
    const store = useStore();

    const createStory = () => {
        console.log("currentStoryId", store.state.Modules.DataNarrator.EditStoryForm.state);
    }

    return {
        currentStoryId,

        createStory
    };
}
