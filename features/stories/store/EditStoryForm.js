import {generateSimpleGetters, generateSimpleMutations} from "../../../../../../src/shared/js/utils/generators";


export const state = {
    isLoading: false,
    selectedStoryId: null,
    storyTitle: '',
    storyDescription: '',
};

export const mutations = {
    ...generateSimpleMutations(state),

    setSelectedStoryId(state, selectedStoryId) {
        console.log('selectedStoryId', selectedStoryId);
        state.selectedStoryId = selectedStoryId;
    },

    setStoryData(state, storyData) {
        state.storyTitle = storyData.title;
        state.storyDescription = storyData.description;
    },

    resetStoryForm(state) {
        console.log("reset story form")
        state.storyTitle = '';
        state.storyDescription = '';
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
