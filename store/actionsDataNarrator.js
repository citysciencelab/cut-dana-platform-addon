import storyCreatorActions from "./actions/storyCreatorActions";
import stateDataNarrator from "./stateDataNarrator";
import threeDManagerActions from "./actions/threeDManagerActions";

import axios from "axios";

const initialState = JSON.parse(JSON.stringify(stateDataNarrator)),
    actions = {
        ...storyCreatorActions,
        ...threeDManagerActions,

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
            commit("setCurrentStory", initialState.currentStory);
            commit("setCurrentStoryId", initialState.currentStoryId);
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
