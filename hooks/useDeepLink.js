import { onMounted } from 'vue';

import { useStory } from '../features/stories/hooks/useStory';

import { dataNarratorModes } from '../store/contantsDataNarrator';

import { useDataNarrator } from './useDataNarrator';

export function useDeepLink() {
    const { currentStoryId } = useStory();
    const { gotoPage } = useDataNarrator();

    onMounted(() => {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');

        if (id && window.location.pathname.includes('/portal/stories')) {
            currentStoryId.value = id;
            gotoPage(dataNarratorModes.PLAY_STORY);
        }
    });
}
