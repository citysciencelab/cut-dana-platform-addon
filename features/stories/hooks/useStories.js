import { ref } from 'vue';

import { useStore } from 'vuex';

import { useStoryForm } from './useStoryForm';

/**
 *
 */
export function useStories () {
    const currentStoryId = ref('');
    const store = useStore();

    const createStory = () => {
        console.log('currentStoryId', store.state.Modules.DataNarrator.EditStoryForm.state);
    }

    return {
        currentStoryId,

        createStory
    };
}
