import {generateSimpleMutations} from "../../../../src/shared/js/utils/generators.js";
import stateDataNarrator from "./stateDataNarrator";
import threeDManagerMutations from "./mutations/threeDManagerMutations";

const mutations = {
    /**
     * Creates from every state-key a setter.
     * For example, given a state object {key: value}, an object
     * {setKey:   (state, payload) => *   state[key] = payload * }
     * will be returned.
     */
    ...generateSimpleMutations(stateDataNarrator),

    ...threeDManagerMutations,

    /**
     * If name from config.json starts with "translate#", the corrected key is set to name here.
     * @param {object} state of this component
     * @param {string} payload name of this component
     * @returns {void}
     */
    applyTranslationKey: (state, payload) => {
        if (payload && payload.indexOf("translate#") > -1) {
            state.name = payload.slice("translate#".length);
        }
    }
};

export default mutations;
