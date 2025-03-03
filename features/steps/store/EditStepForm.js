import {generateSimpleGetters, generateSimpleMutations} from "../../../../../../src/shared/js/utils/generators";

export const state = {
    isStepFormLoading: false,
    selectedStepId: null,
};

export const mutations = {
    ...generateSimpleMutations(state),

    setSelectedStepId(state, selectedStepId) {
        state.selectedStepId = selectedStepId;
    },

    setStepData(state, stepData) {
    },

    resetStepForm(state) {
        state.isStepFormLoading = false;
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
    getters
};
