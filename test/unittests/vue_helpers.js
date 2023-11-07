import Vue from "vue";
import Vuex from "vuex";
import Vuetify from "vuetify";
import DataNarrator from "../../store/DataNarrator";
import Login from "../../../../../src/modules/tools/login/store/indexLogin";
import {config, createLocalVue} from "@vue/test-utils";

Vue.use(Vuetify);

export const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

// eslint-disable-next-line one-var
export const testStore = new Vuex.Store({
    namespaces: true,
    modules: {
        Tools: {
            namespaced: true,
            modules: {
                DataNarrator,
                Login
            }
        }
    },
    state: {
        configJson: {
            Portalconfig: {
                menu: {
                    tools: {
                        children: {
                            dataNarrator: {
                                "name": "translate#additional:modules.tools.dataNarrator.title",
                                "glyphicon": "glyphicon-book",
                                "active": true,
                                "backendURL": "http://localhost:3000",
                                "autoplay": true
                            }
                        }
                    }
                }
            }
        }
    }
});

testStore.commit("Tools/DataNarrator/setActive", true);
