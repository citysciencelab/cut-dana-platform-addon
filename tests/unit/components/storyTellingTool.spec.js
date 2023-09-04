import Vue from "vue";
import Vuex from "vuex";
import Vuetify from "vuetify";
import {config, createLocalVue, shallowMount} from "@vue/test-utils";
import {expect} from "chai";
import DataNarratorComponent from "../../../components/DataNarrator.vue";
import DataNarrator from "../../../store/DataNarrator";
import {storyTellingModes} from "../../../store/constantsDataNarrator";

Vue.use(Vuetify);

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("addons/DatNarrator/components/DataNarrator.vue", () => {
    global.Config = {};
    const mockConfigJson = {
        Portalconfig: {
            menu: {
                tools: {
                    children: {
                        dataNarrator: {
                            name:
                                "translate#additional:modules.tools.dataNarrator.title",
                            glyphicon: "glyphicon-book"
                        }
                    }
                }
            }
        }
    };
    let store;

    beforeEach(() => {
        store = new Vuex.Store({
            namespaces: true,
            modules: {
                Tools: {
                    namespaced: true,
                    modules: {
                        DataNarrator
                    }
                }
            },
            state: {
                configJson: mockConfigJson
            }
        });
        store.commit("Tools/DataNarrator/setActive", true);
    });

    it("renders the DataNarrator tool", () => {
        const wrapper = shallowMount(DataNarratorComponent, {
            store,
            localVue
        });

        expect(wrapper.find("#tool-dataNarrator").exists()).to.be.true;
        expect(wrapper.find("#tool-dataNarrator-modeSelection").exists()).to
            .be.true;
    });

    it("do not render the DataNarrator tool if not active", () => {
        store.commit("Tools/DataNarrator/setActive", false);
        const wrapper = shallowMount(DataNarratorComponent, {
            store,
            localVue
        });

        expect(wrapper.find("#tool-dataNarrator").exists()).to.be.false;
        expect(wrapper.find("#tool-dataNarrator-modeSelection").exists()).to
            .be.false;
    });

    xit("renders the UI of the story creator when selected", async () => {
        const wrapper = shallowMount(DataNarratorComponent, {
            store,
            localVue,
            stubs: {
                StoryCreator: true,
                StoryPlayer: true
            }
        });

        await wrapper.setData({mode: storyTellingModes.CREATE});

        expect(wrapper.find("#tool-dataNarrator").exists()).to.be.true;
        expect(wrapper.find("#tool-dataNarrator-modeSelection").exists()).to
            .be.false;
        expect(wrapper.find("storycreator-stub").exists()).to.be.true;
        expect(wrapper.find("storyplayer-stub").exists()).to.be.false;
    });

    xit("renders the UI of the story player when selected", async () => {
        const wrapper = shallowMount(DataNarratorComponent, {
            store,
            localVue,
            stubs: {
                StoryCreator: true,
                StoryPlayer: true
            }
        });

        await wrapper.setData({
            mode: storyTellingModes.PLAY,
            storyConfPath: "/"
        });

        expect(wrapper.find("#tool-dataNarrator").exists()).to.be.true;
        expect(wrapper.find("#tool-dataNarrator-modeSelection").exists()).to
            .be.false;
        expect(wrapper.find("storycreator-stub").exists()).to.be.false;
        expect(wrapper.find("storyplayer-stub").exists()).to.be.true;
    });
});
