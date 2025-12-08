import { defineStore } from 'pinia';

import { generateSimpleGetters, generateSimpleMutations } from '../../../../../../src/shared/js/utils/generators';

export const usePiniaStoryStore = defineStore('story', {
    state: () => ({
        selectedStoryId: null,
        coverImage: null,
        storyTitle: '',
        storyDescription: '',
        storyChapters: [],
    }),

    getters: {
        // Spread the simple getters
        ...generateSimpleGetters({
            isLoading: false,
            selectedStoryId: null,
            coverImage: null,
            storyTitle: '',
            storyDescription: '',
            storyChapters: [],
        }),
    },

    actions: {
        // In Pinia, mutations are replaced with actions
        // These are the simple mutations converted to actions
        ...generateSimpleMutations({
            isLoading: false,
            selectedStoryId: null,
            coverImage: null,
            storyTitle: '',
            storyDescription: '',
            storyChapters: [],
        }),

        // Custom actions (replacing mutations)
        setSelectedStoryId(selectedStoryId) {
            this.selectedStoryId = selectedStoryId;
        },

        setStoryData(storyData) {
            console.log('storyData', storyData);
            this.storyTitle = storyData.title;
            this.storyDescription = storyData.description;
            this.storyChapters = storyData.chapters;
        },

        resetStoryForm() {
            this.storyTitle = '';
            this.storyDescription = '';
            this.isLoading = false;
            this.selectedStoryId = null;
        }
    }
});
