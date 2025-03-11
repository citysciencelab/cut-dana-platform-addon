import {ref} from "vue";

/**
 *
 */
export function useStories () {
    const currentStoryId = ref("");

    const createStory = () => {

    }

    return {
        currentStoryId,

        createStory
    };
}
