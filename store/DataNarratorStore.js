import state from "./stateDataNarrator";
import mutations from "./mutationsDataNarrator";
import getters from "./gettersDataNarrator";
import EditStoryForm from "../features/stories/store/EditStoryForm";

export default {
    namespaced: true,
    state,
    mutations,
    getters,
    modules: {
        EditStoryForm
    }
};
