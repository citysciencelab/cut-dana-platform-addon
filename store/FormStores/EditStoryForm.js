import {generateSimpleGetters, generateSimpleMutations} from "../../../../../src/shared/js/utils/generators";


export const state = {
    isLoading: false,
    selectedStoryId: null,
    title: 'TESTING TITLE',
    description: '',
};

export const mutations = {
    ...generateSimpleMutations(state),

    setSelectedStoryId(state, selectedStoryId) {
        console.log('selectedStoryId', selectedStoryId);
        state.selectedStoryId = selectedStoryId;
    },

    setStoryData(state, storyData) {
        state.title = storyData.title;
        state.description = storyData.description;
    },

    resetStoryForm(state) {
        console.log("reset story form")
        state.title = '';
        state.description = '';
        state.isLoading = false;
        state.selectedStoryId = null;
    }
};

export const getters = {
    ...generateSimpleGetters(state)
}

export default {
    namespaced: true,
    state,
    mutations,
    getters,
};
