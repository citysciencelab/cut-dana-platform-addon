import {expect} from "chai";
import {shallowMount} from "@vue/test-utils";

import {storyCreationViews} from "../../../../store/constantsDataNarrator";
import StoryCreator from "../../../../components/storyCreator/StoryCreator.vue";

import {wrapperOptions} from "../../vue_helpers";

describe("StoryCreator", () => {
    it("renders the StoryForm component when view is STORY_CREATION", () => {
        const wrapper = shallowMount(StoryCreator, {
            ...wrapperOptions,
            data () {
                return {
                    view: storyCreationViews.STORY_CREATION
                };
            }
        });

        expect(wrapper.findComponent({name: "StoryForm"}).exists()).to.be.true;
    });

    it("renders the StepForm component when view is STEP_CREATION", () => {
        const wrapper = shallowMount(StoryCreator, {
            ...wrapperOptions,
            data () {
                return {
                    view: storyCreationViews.STEP_CREATION
                };
            }
        });

        expect(wrapper.findComponent({name: "StepForm"}).exists()).to.be.true;
    });

    it("renders the StoryPlayer component when view is PREVIEW", () => {
        const wrapper = shallowMount(StoryCreator, {
            ...wrapperOptions,
            data () {
                return {
                    view: storyCreationViews.PREVIEW
                };
            }
        });

        expect(wrapper.findComponent({name: "StoryPlayer"}).exists()).to.be.true;
    });

    it("sets the view to STEP_CREATION when onEditStep is called", () => {
        const wrapper = shallowMount(StoryCreator, wrapperOptions);

        wrapper.vm.onEditStep({});

        expect(wrapper.vm.view).to.equal(storyCreationViews.STEP_CREATION);
    });

    it("sets the view to STORY_CREATION and clears stepToEdit when returnToStoryForm is called", () => {
        const wrapper = shallowMount(StoryCreator, {
            ...wrapperOptions,
            data () {
                return {
                    view: storyCreationViews.STEP_CREATION,
                    stepToEdit: {}
                };
            }
        });

        wrapper.vm.returnToStoryForm();

        expect(wrapper.vm.view).to.equal(storyCreationViews.STORY_CREATION);
        expect(wrapper.vm.stepToEdit).to.be.null;
    });
});
