import {shallowMount} from "@vue/test-utils";
import {expect} from "chai";

import DataNarrator from "../../../components/DataNarrator.vue";
import {storyTellingModes} from "../../../store/constantsDataNarrator";


import {localVue, testStore} from "../vue_helpers";

describe("addons/DatNarrator/components/DataNarrator.vue", () => {
    global.Config = {};
    let store;

    beforeEach(() => {
        store = testStore;
        store.commit("Tools/DataNarrator/setActive", true);
    });

    it("renders the DataNarrator tool", () => {
        const wrapper = shallowMount(DataNarrator, {
            store,
            localVue
        });

        expect(wrapper.find("#tool-dataNarrator").exists()).to.be.true;
    });

    it("do not render the DataNarrator tool if not active", () => {
        store.commit("Tools/DataNarrator/setActive", false);
        const wrapper = shallowMount(DataNarrator, {
            store,
            localVue
        });

        expect(wrapper.find("#tool-dataNarrator").exists()).to.be.false;
    });

    it("renders the UI of the story creator when selected", async () => {
        store.commit("Tools/DataNarrator/setMode", storyTellingModes.CREATE);
        const wrapper = shallowMount(DataNarrator, {
            store,
            localVue
        });

        expect(wrapper.find("#tool-dataNarrator").exists()).to.be.true;
        expect(wrapper.find("dashboardpanel-stub").exists()).to.be.false;
        expect(wrapper.find("storycreator-stub").exists()).to.be.true;
        expect(wrapper.find("storyplayer-stub").exists()).to.be.false;
    });

    it("renders the UI of the story player when selected", async () => {
        store.commit("Tools/DataNarrator/setMode", storyTellingModes.PLAY);
        const wrapper = shallowMount(DataNarrator, {
            store,
            localVue
        });

        expect(wrapper.find("#tool-dataNarrator").exists()).to.be.true;
        expect(wrapper.find("dashboardpanel-stub").exists()).to.be.false;
        expect(wrapper.find("storycreator-stub").exists()).to.be.false;
        expect(wrapper.find("storyplayer-stub").exists()).to.be.true;
    });

    it("renders the UI of the dashboard when no mode is selected", async () => {
        const wrapper = shallowMount(DataNarrator, {
            store,
            localVue
        });

        expect(wrapper.find("#tool-dataNarrator").exists()).to.be.true;
        expect(wrapper.find("dashboardpanel-stub").exists()).to.be.true;
        expect(wrapper.find("storycreator-stub").exists()).to.be.false;
        expect(wrapper.find("storyplayer-stub").exists()).to.be.false;
    });
});
