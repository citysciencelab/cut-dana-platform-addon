import {generateSimpleGetters, generateSimpleMutations} from "../../../../../../src/shared/js/utils/generators";

export const state = {
    selectedStoryId: null,
};

export const mutations = {
    ...generateSimpleMutations(state),

    setSelectedStoryId (state, selectedStoryId) {
        state.selectedStoryId = selectedStoryId;
    },
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
