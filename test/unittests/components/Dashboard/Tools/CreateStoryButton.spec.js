import {expect} from "chai";
import {shallowMount} from "@vue/test-utils";
import sinon from "sinon";

import CreateStoryButton from "../../../../../components/Dashboard/Tools/CreateStoryButton.vue";
import {emptyStory, storyTellingModes} from "../../../../../store/constantsDataNarrator";

import {wrapperOptions, testStore} from "../../../vue_helpers";

describe("CreateStoryButton.vue", () => {
    it("should create a new story when clicked", async () => {
        testStore.commit("Modules/Login/setScreenName", "John Doe");


        const wrapper = shallowMount(CreateStoryButton, wrapperOptions),

            setCurrentStory = sinon.stub(wrapper.vm, "setCurrentStory"),
            setCurrentStoryId = sinon.stub(wrapper.vm, "setCurrentStoryId"),
            setMode = sinon.stub(wrapper.vm, "setMode");


        await wrapper.vm.createStory();

        expect(setCurrentStory.calledOnce).to.equal(true);
        expect(setCurrentStory.getCall(0).args[0]).to.eql({
            ...emptyStory,
            author: "John Doe"
        });

        expect(setCurrentStoryId.calledOnce).to.equal(true);
        expect(setCurrentStoryId.getCall(0).args[0]).to.eql(null);


        expect(setMode.calledOnce).to.equal(true);
        expect(setMode.getCall(0).args[0]).to.eql(storyTellingModes.CREATE);

        sinon.restore();
    });
});
