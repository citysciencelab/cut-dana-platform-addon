import {generateSimpleGetters, generateSimpleMutations} from "../../../../../../src/shared/js/utils/generators";


export const state = {
    isLoading: false,
    selectedStoryId: null,
    coverImage: null,
    storyTitle: "",
    storyDescription: "",
    storyChapters: [],
};

// eslint-disable-next-line one-var
export const mutations = {
    ...generateSimpleMutations(state),

    // eslint-disable-next-line no-shadow
    setSelectedStoryId (state, selectedStoryId) {
        state.selectedStoryId = selectedStoryId;
    },

    // eslint-disable-next-line no-shadow
    setStoryData (state, storyData) {
        console.log("storyData",storyData);
        state.storyTitle = storyData.title;
        state.storyDescription = storyData.description;
        state.storyChapters = storyData.chapters;
    },

    // eslint-disable-next-line no-shadow
    resetStoryForm (state) {
        state.storyTitle = "";
        state.storyDescription = "";
        state.isLoading = false;
        state.selectedStoryId = null;
    }
};

export const getters = {
    ...generateSimpleGetters(state)
};

export default {
    namespaced: true,
    state,
    mutations,
    getters,
};
