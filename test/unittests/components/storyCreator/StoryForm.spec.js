import {expect} from "chai";
import {shallowMount} from "@vue/test-utils";

import StoryForm from "../../../../components/storyCreator/StoryForm.vue";
import {emptyStory} from "../../../../store/constantsDataNarrator";

import {wrapperOptions, testStore} from "../../vue_helpers";

describe("StoryForm", () => {
    let wrapper;

    beforeEach(() => {
        testStore.commit("Modules/DataNarrator/setCurrentStory", emptyStory);
        wrapper = shallowMount(StoryForm, {
            ...wrapperOptions,
            computed: {
                mobile () {
                    return false;
                }
            }
        });
    });

    afterEach(() => {
        wrapper.destroy();
    });

    it("renders the component", () => {
        expect(wrapper.exists()).to.be.true;
    });

    it("has a form with an id of 'story-form'", () => {
        const form = wrapper.find("#story-form");

        expect(form.exists()).to.be.true;
    });

    it("has a title input with a label", () => {
        const label = wrapper.find("label[for='title']"),
            input = wrapper.find("#title");

        expect(label.exists()).to.be.true;
        expect(label.text()).to.equal("additional:modules.tools.dataNarrator.label.storyName");
        expect(input.exists()).to.be.true;
        expect(input.attributes("type")).to.equal("text");
        expect(input.attributes("required")).to.equal("required");
    });

    it("has a description textarea with a label", () => {
        const label = wrapper.find("label[for='description']"),
            textarea = wrapper.find("#description");

        expect(label.exists()).to.be.true;
        expect(label.text()).to.equal("additional:modules.tools.dataNarrator.label.storyDescription");
        expect(textarea.exists()).to.be.true;
    });

    it("has a cover input with a label", () => {
        const label = wrapper.find("label[for='cover']"),
            input = wrapper.find("#cover");

        expect(label.exists()).to.be.true;
        expect(input.exists()).to.be.true;
        expect(input.attributes("type")).to.equal("file");
        expect(input.attributes("accept")).to.equal("image/png, image/jpeg");
    });

    it("has a ShareSettings component", () => {
        const shareSettings = wrapper.findComponent({name: "ShareSettings"});

        expect(shareSettings.exists()).to.be.true;
    });

    it("has a slide group with a label", () => {
        const label = wrapper.find("label[for='slide-navigation']"),
            slideGroup = wrapper.find("#slide-navigation");

        expect(label.exists()).to.be.true;
        expect(label.text()).to.equal("additional:modules.tools.dataNarrator.label.steps");
        expect(slideGroup.exists()).to.be.true;
    });

    it("has an expansion panel with advanced options", () => {
        const expansionPanel = wrapper.findComponent({name: "VExpansionPanel"}),
            header = expansionPanel.findComponent({name: "VExpansionPanelHeader"}),
            content = expansionPanel.findComponent({name: "VExpansionPanelContent"}),
            checkbox = content.find("#story-scrolly");

        expect(expansionPanel.exists()).to.be.true;
        expect(header.exists()).to.be.true;
        expect(header.text()).to.equal("additional:modules.tools.dataNarrator.label.advancedOptions");
        expect(content.exists()).to.be.true;
        expect(checkbox.exists()).to.be.true;
        expect(checkbox.attributes("type")).to.equal("checkbox");
    });
});
