import {generateSimpleGetters, generateSimpleMutations} from "../../../../../../src/shared/js/utils/generators";

export const state = {
    isLoading: false,
    selectedChapterId: null,
    chapterName: ""
}; // TODO@JOREN: will we edit the sequence within the form? probably not

// eslint-disable-next-line one-var
export const mutations = {
    ...generateSimpleMutations(state),

    // eslint-disable-next-line no-shadow
    setSelectedStoryId (state, selectedChapterId) {
        state.selectedChapterId = selectedChapterId;
    },

    // eslint-disable-next-line no-shadow
    setChapterData (state, chapterData) {
        state.chapterName = chapterData.name;
    },

    // eslint-disable-next-line no-shadow
    resetStoryForm (state) {
        state.chapterName = "";
        state.isLoading = false;
        state.selectedChapterId = null;
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
