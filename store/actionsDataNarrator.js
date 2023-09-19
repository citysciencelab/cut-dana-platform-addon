import storyCreatorActions from "./actions/storyCreatorActions";
import stateDataNarrator from "./stateDataNarrator";
import * as constants from "./constantsDataNarrator";

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
            commit("setStoryConf", initialState.storyConf);
            commit("setHtmlContents", initialState.htmlContents);
            commit("setHtmlContentsImages", initialState.htmlContentsImages);
            commit("setInitialWidth", initialState.initialWidth);
        },

        /**
         * Resets the Story Telling Tool without deleting loaded stories
         *
         * @param {Object} context actions context object.
         * @returns {void}
         */
        resetCreatorContent ({commit}) {
            commit("setHtmlContents", initialState.htmlContents);
            commit("setHtmlContentsImages", initialState.htmlContentsImages);
            commit("setInitialWidth", initialState.initialWidth);
        },

        loadCurrentStory ({state, commit}, {mode}) {
            axios.get(state.backendConfig.url + "story/" + state.currentStoryId).then((response) => {
                commit("setStoryConf", response.data); // compatibility, remove later
                commit("setCurrentStory", response.data);
                commit("setMode", mode);
            });
        }

        // saveStory ({state, commit}) {


        // },
    };

export default actions;
