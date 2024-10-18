import actions from "./actionsDataNarrator";
import getters from "./gettersDataNarrator";
import mutations from "./mutationsDataNarrator";
import state from "./stateDataNarrator";

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
};
