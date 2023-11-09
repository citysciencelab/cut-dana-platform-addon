import {shallowMount} from "@vue/test-utils";
import {expect} from "chai";

import DataNarrator from "../../../components/DataNarrator.vue";
import {storyTellingModes} from "../../../store/constantsDataNarrator";

import {wrapperOptions, testStore} from "../vue_helpers";

describe("addons/DatNarrator/components/DataNarrator.vue", () => {
    global.Config = {};
    let wrapper;

    beforeEach(async () => {
        testStore.commit("Tools/DataNarrator/setActive", true);
        wrapper = await shallowMount(DataNarrator, wrapperOptions);
    });

    afterEach(async () => {
        await wrapper.destroy();
    });

    it("renders the DataNarrator tool", () => {
        expect(wrapper.find("#tool-dataNarrator").exists()).to.be.true;
    });

    it("do not render the DataNarrator tool if not active", async () => {
        await testStore.commit("Tools/DataNarrator/setActive", false);

        expect(wrapper.find("#tool-dataNarrator").exists()).to.be.false;
    });

    it("renders the UI of the story creator when selected", async () => {
        await testStore.commit("Tools/DataNarrator/setMode", storyTellingModes.CREATE);

        expect(wrapper.find("#tool-dataNarrator").exists()).to.be.true;
        expect(wrapper.find("dashboardpanel-stub").exists()).to.be.false;
        expect(wrapper.find("storycreator-stub").exists()).to.be.true;
        expect(wrapper.find("storyplayer-stub").exists()).to.be.false;
    });

    it("renders the UI of the story player when selected", async () => {
        await testStore.commit("Tools/DataNarrator/setMode", storyTellingModes.PLAY);

        expect(wrapper.find("#tool-dataNarrator").exists()).to.be.true;
        expect(wrapper.find("dashboardpanel-stub").exists()).to.be.false;
        expect(wrapper.find("storycreator-stub").exists()).to.be.false;
        expect(wrapper.find("storyplayer-stub").exists()).to.be.true;
    });

    it("renders the UI of the dashboard when no mode is selected", () => {
        expect(wrapper.find("#tool-dataNarrator").exists()).to.be.true;
        expect(wrapper.find("dashboardpanel-stub").exists()).to.be.true;
        expect(wrapper.find("storycreator-stub").exists()).to.be.false;
        expect(wrapper.find("storyplayer-stub").exists()).to.be.false;
    });
});
