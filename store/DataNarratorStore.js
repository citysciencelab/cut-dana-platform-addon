import state from "./stateDataNarrator";
import mutations from "./mutationsDataNarrator";
import getters from "./gettersDataNarrator";
import EditStoryForm from "../features/stories/store/EditStoryForm";
import EditStepForm from "../features/steps/store/EditStepForm";
import DashboardStore from "../features/dashboard/store/DashboardStore";
import StoryStore from "../features/stories/store/StoryStore";

export default {
    namespaced: true,
    state,
    mutations,
    getters,
    modules: {
        EditStoryForm,
        EditStepForm,
        DashboardStore,
        StoryStore
    }
};
