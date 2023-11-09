import {expect} from "chai";
import {shallowMount} from "@vue/test-utils";

import ClassicPlayer from "../../../../components/storyPlayer/ClassicPlayer.vue";

import {emptyStory} from "../../../../store/constantsDataNarrator";
import {wrapperOptions, testStore} from "../../vue_helpers";

describe("ClassicPlayer", () => {
    testStore.commit("Tools/DataNarrator/setCurrentStory", emptyStory);

    it("renders the correct chapter title", () => {
        const currentChapter = {chapterTitle: "Chapter 1"},
            currentStep = {title: "Step 1"},
            wrapper = shallowMount(ClassicPlayer, {
                ...wrapperOptions,
                propsData: {currentChapter, currentStep}
            });

        expect(wrapper.find("h2").text()).to.equal("Chapter 1");
    });

    it("renders the correct step title", () => {
        const currentStep = {title: "Step 1"},
            wrapper = shallowMount(ClassicPlayer, {
                ...wrapperOptions,
                propsData: {currentStep}
            });

        expect(wrapper.find("h1").text()).to.equal("Step 1");
    });

    it("renders the loaded content", () => {
        const loadedContent = "<p>Some content</p>",
            currentStep = {title: "Step 1"},
            wrapper = shallowMount(ClassicPlayer, {
                ...wrapperOptions,
                propsData: {loadedContent, currentStep}
            });

        expect(wrapper.find(".tool-dataNarrator-content").html()).to.contain(loadedContent);
    });

    it("renders the StoryMenu component", () => {
        const currentStep = {title: "Step 1"},
            wrapper = shallowMount(ClassicPlayer, {
                ...wrapperOptions,
                propsData: {currentStep}
            });

        expect(wrapper.find("storymenu-stub").exists()).to.be.true;
    });
});
