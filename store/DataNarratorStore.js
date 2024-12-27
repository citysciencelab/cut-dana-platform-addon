import state from "./stateDataNarrator";
import mutations from "./mutationsDataNarrator";
import getters from "./gettersDataNarrator";

export default {
    namespaced: true,
    state: {...state},
    mutations,
    getters
};
