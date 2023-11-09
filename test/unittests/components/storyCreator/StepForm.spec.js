import {expect} from "chai";
import {shallowMount} from "@vue/test-utils";
import sinon from "sinon";


import StepForm from "../../../../components/storyCreator/StepForm.vue";
import {emptyStory} from "../../../../store/constantsDataNarrator";

import {wrapperOptions, testStore} from "../../vue_helpers";

describe("StepForm", () => {
    let wrapper;

    beforeEach(() => {
        testStore.commit("Tools/DataNarrator/setCurrentStory", emptyStory);
        wrapper = shallowMount(StepForm, {
            ...wrapperOptions,
            computed: {
                importedFileNames () {
                    return [];
                },
                backgroundMaps () {
                    return [];
                },
                layerOptions () {
                    return [];
                },
                addonOptions () {
                    return [];
                },
                mobile () {
                    return false;
                }
            }
        });
    });

    afterEach(() => {
        wrapper.destroy();
        sinon.restore();
    });

    it("renders a form with the correct fields", () => {
        expect(wrapper.find("form")).to.exist;
        expect(wrapper.find("#step-title")).to.exist;
        expect(wrapper.find("#step-content")).to.exist;
        expect(wrapper.find("#step-image")).to.exist;
        expect(wrapper.find("#step-submit")).to.exist;
    });

    it("emits a \"return\" event when the form is submitted", async () => {
        const saveStoryStep = sinon.stub(wrapper.vm, "saveStoryStep");

        await wrapper.vm.onSubmit();

        expect(saveStoryStep.calledOnce).to.be.true;
        expect(wrapper.emitted().return).to.exist;
    });
});
