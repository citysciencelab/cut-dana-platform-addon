import {ref} from "vue";

/**
 *
 */
export function useStories () {
    const currentStoryId = ref("");

    return {
        currentStoryId
    };
}
