import {expect} from "chai";
import {mount} from "@vue/test-utils";
import sinon from "sinon";

import StoryMenu from "../../../../components/storyPlayer/StoryMenu.vue";
import {emptyStory} from "../../../../store/constantsDataNarrator";

import {wrapperOptions, testStore} from "../../vue_helpers";

describe("StoryMenu", () => {
    let wrapper, resetMethod;

    beforeEach(() => {
        wrapper = mount(StoryMenu, wrapperOptions);
        testStore.commit("Tools/DataNarrator/setMode", "classic");
        testStore.commit("Tools/DataNarrator/setCurrentStoryId", 13);
        testStore.commit("Tools/DataNarrator/setCurrentStory", {
            ...emptyStory,
            displayType: "scrolly",
            storyInterval: 3000
        });
    });

    afterEach(() => {
        wrapper.destroy();
        sinon.restore();
    });

    it("renders the component", () => {
        expect(wrapper.exists()).to.be.true;
    });

    it("toggles auto play when clicked", () => {
        const autoPlayButton = wrapper.find("#auto-play-button");

        autoPlayButton.trigger("click");
        expect(wrapper.vm.isAutoPlay).to.be.true;
        autoPlayButton.trigger("click");
        expect(wrapper.vm.isAutoPlay).to.be.false;
    });

    it("toggles scrollytelling when clicked", () => {
        const scrollyButton = wrapper.find(".scrolly-button");

        scrollyButton.trigger("click");
        expect(wrapper.vm.isScrollytelling).to.be.true;
        scrollyButton.trigger("click");
        expect(wrapper.vm.isScrollytelling).to.be.false;
    });

    it("emits a \"share-story\" event when share button is clicked", () => {
        const shareButton = wrapper.find("#share-button");

        shareButton.trigger("click");
        // $emit('share-story', currentStoryId, currentStepIndex)
        expect(wrapper.emitted("share-story")).to.deep.equal([[13, 0]]);
    });

    it("resets the story when reset button is clicked", () => {
        const resetButton = wrapper.find("#reset-button");

        resetButton.trigger("click");
        expect(resetMethod.withArgs("resetStory").calledOnce).to.be.true;
    });
});
