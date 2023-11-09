import {expect} from "chai";
import {shallowMount} from "@vue/test-utils";

import StoryCard from "../../../../../components/Dashboard/Stories/StoryCard.vue";
import {wrapperOptions} from "../../../vue_helpers";

describe("StoryCard.vue", () => {
    let wrapper;

    beforeEach(() => {
        wrapper = shallowMount(StoryCard, {
            ...wrapperOptions,
            propsData: {
                story: {
                    _id: "123",
                    title: "Test Story",
                    author: "Test Author",
                    description: "Test Description",
                    owner: "testuser",
                    featured: false
                },
                uid: "testuser",
                isAdmin: true,
                grid: true
            }
        });
    });

    afterEach(() => {
        wrapper.destroy();
    });

    it("renders the correct title", () => {
        expect(wrapper.find(".text-h6").text()).to.equal("Test Story");
    });

    it("renders the correct author", () => {
        expect(wrapper.find("v-card-subtitle-stub").text()).to.include("Test Author");
    });

    it("renders the correct description", () => {
        expect(wrapper.find("v-card-text-stub").text()).to.equal("Test Description");
    });

    it("renders the PlayButton component", () => {
        expect(wrapper.find("playbutton-stub").exists()).to.be.true;
    });

    it("renders the ShareButton component", () => {
        expect(wrapper.find("sharebutton-stub").exists()).to.be.true;
    });

    it("renders the EditButton component", () => {
        expect(wrapper.find("editbutton-stub").exists()).to.be.true;
    });

    it("renders the DeleteButton component", () => {
        expect(wrapper.find("deletebutton-stub").exists()).to.be.true;
    });

    it("renders the FeaturedButton component", () => {
        expect(wrapper.find("featuredbutton-stub").exists()).to.be.true;
    });

    it("renders the ShareSettingsButton component", () => {
        expect(wrapper.find("sharesettingsbutton-stub").exists()).to.be.true;
    });

    it("renders the ShareSettingsForm component", async () => {
        expect(wrapper.find("sharesettingsform-stub").exists()).to.be.false;

        await wrapper.find("sharesettingsbutton-stub").vm.$emit(
            "toggle:shared-settings"
        );
        expect(wrapper.find("sharesettingsform-stub").exists()).to.be.true;
    });
});
