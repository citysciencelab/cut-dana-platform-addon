import storyCreatorActions from "./actions/storyCreatorActions";
import stateDataNarrator from "./stateDataNarrator";

import axios from "axios";

const initialState = JSON.parse(JSON.stringify(stateDataNarrator)),
    actions = {
        ...storyCreatorActions,

        /**
         * Resets the Story Telling Tool.
         *
         * @param {Object} context actions context object.
         * @returns {void}
         */
        resetModule ({commit}) {
            // Reset store data
            commit("setHtmlContentsImages", initialState.htmlContentsImages);
            commit("setInitialWidth", initialState.initialWidth);
            commit("setCurrentStory", null);
            commit("setCurrentStoryId", null);
        },


        /**
         * Sets the current story.
         * @param {Object} context actions context object.
         * @returns {void}
         */

        loadCurrentStory ({state, commit}, {mode}) {
            axios.get(state.backendConfig.url + "/stories/" + state.currentStoryId).then((response) => {
                commit("setCurrentStory", response.data);
                commit("setMode", mode);
            });
        }


    };

export default actions;
