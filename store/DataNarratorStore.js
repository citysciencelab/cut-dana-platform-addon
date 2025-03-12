import state from "./stateDataNarrator";
import mutations from "./mutationsDataNarrator";
import getters from "./gettersDataNarrator";
import EditStoryForm from "../features/stories/store/EditStoryForm";
import EditStepForm from "../features/steps/store/EditStepForm";
import EditChapterForm from "../features/chapters/store/EditChapterForm";

export default {
    namespaced: true,
    state,
    mutations,
    getters,
    modules: {
        EditStoryForm,
        EditChapterForm,
        EditStepForm
    }
};
