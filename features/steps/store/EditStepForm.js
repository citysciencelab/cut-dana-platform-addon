import {generateSimpleGetters, generateSimpleMutations} from "../../../../../../src/shared/js/utils/generators";

export const state = {
    isStepFormLoading: false,
    selectedStepId: null,
    stepNumber: 0,
    stepChapterId: "",
    stepWidth: 0,
    stepVisible: false,
    stepTitle: "",
    stepDescription: "",
    stepCenterCoordinates: [], // float array
    stepZoomLevel: 0,
    stepInteractionAddons: [], // string array
    stepIs3d: false,
    stepNavigation3dId: 0,
    stepBackgroundMapId: 0,
};

export const mutations = {
    ...generateSimpleMutations(state),

    setSelectedStepId(state, selectedStepId) {
        state.selectedStepId = selectedStepId;
    },

    setStepData(state, stepData) {
        state.stepNumber = stepData.stepNumber;
        state.stepChapterId = stepData.stepChapterId;
        state.stepWidth = stepData.stepWidth;
        state.stepVisible = stepData.stepVisible;
        state.stepTitle = stepData.stepTitle;
        state.stepDescription = stepData.stepDescription;
        state.stepCenterCoordinates = stepData.stepCenterCoordinates;
        state.stepZoomLevel = stepData.stepZoomLevel;
        state.stepInteractionAddons = stepData.stepInteractionAddons;
        state.stepIs3d = stepData.stepIs3d;
        state.stepNavigation3dId = stepData.stepNavigation3dId;
        state.stepBackgroundMapId = stepData.stepBackgroundMapId;
    },

    resetStepForm(state) {
        state.isStepFormLoading = false;
        state.selectedStoryId = null;
        state.stepNumber = 0;
        state.stepChapterId = "";
        state.stepWidth = 0;
        state.stepVisible = false;
        state.stepTitle = "";
        state.stepDescription = "";
        state.stepCenterCoordinates = {};
        state.stepZoomLevel = 0;
        state.stepInteractionAddons = [];
        state.stepIs3d = false;
        state.stepNavigation3dId = 0;
        state.stepBackgroundMapId = 0;
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
