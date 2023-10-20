import storyCreatorActions from "./actions/storyCreatorActions";
import * as constants from "./constantsDataNarrator";
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
            // commit("setCurrentStory", null);
            // commit("setCurrentStoryId", null);
        },


        /**
         * Sets the current story.
         * @param {Object} context actions context object.
         * @returns {void}
         */
        disableStoryLayers ({state}) {
            // Hides all story layers
            const layerList = Radio.request("ModelList", "getModelsByAttributes", {
                isVisibleInMap: true, isSelected: true
            });

            for (const step of state.currentStory.steps) {
                for (const layer of step.layers) {
                    if (typeof layer === "string") {
                        const layerModel = layerList.find(l => l.attributes.id === layer);

                        if (layerModel) {
                            layerModel.setIsVisibleInMap(false);
                            layerModel.set("isSelected", false);
                        }
                    }
                    else {
                        const layerModel = layerList.find(l => l.attributes.id === layer.id);

                        if (layerModel) {
                            layerModel.setIsVisibleInMap(false);
                            layerModel.set("isSelected", false);
                        }
                    }
                }
                // for (const layer of layerList) {
                //     if (step.layers.map(l => l.id).includes(layer.attributes.id)) {
                //         layer.setIsVisibleInMap(false);
                //         layer.set("isSelected", false);
                //     }
                // }

            }

            Radio.trigger("Menu", "rerender");
        },

        /**
         * Resets the Story Telling Tool without deleting loaded stories
         *
         * @param {Object} context actions context object.
         * @returns {void}
         */
        resetCreatorContent ({commit}) {
            commit("setHtmlContentsImages", initialState.htmlContentsImages);
            commit("setInitialWidth", initialState.initialWidth);
            commit("setCurrentStory", null);
            commit("setCurrentStoryId", null);
            commit("setMode", constants.storyTellingModes.DASHBOARD);
        },

        loadCurrentStory ({state, commit}, {mode}) {
            axios.get(state.backendConfig.url + "/stories/" + state.currentStoryId).then((response) => {
                commit("setCurrentStory", response.data);
                commit("setMode", mode);
            });
        }
    };

export default actions;
