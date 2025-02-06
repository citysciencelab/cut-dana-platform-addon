import state from "./stateDataNarrator";
import mutations from "./mutationsDataNarrator";
import getters from "./gettersDataNarrator";
import EditFormStore from "./FormStores/EditStoryForm";

export default {
    namespaced: true,
    state,
    mutations,
    getters,
    modules: {
        EditFormStore
    }
};
