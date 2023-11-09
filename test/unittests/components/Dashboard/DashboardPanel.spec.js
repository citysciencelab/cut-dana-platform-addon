import {expect} from "chai";
import {shallowMount} from "@vue/test-utils";

import DashboardPanel from "../../../../components/Dashboard/DashboardPanel.vue";

import {wrapperOptions, testStore} from "../../vue_helpers";

describe("DashboardPanel.vue", () => {
    global.Config = {};

    const store = testStore;

    it("displays the skeleton while there is no stories", async () => {
        const wrapper = shallowMount(DashboardPanel, wrapperOptions);

        expect(wrapper.findAllComponents({name: "StoryCardSkeleton"}).length).to.equal(10);
    });

    it("displays the story cards", async () => {
        const wrapper = shallowMount(DashboardPanel, {
            ...wrapperOptions,
            data: () => ({
                storyList: [
                    {_id: 1, title: "Story 1", updatedAt: "2020-01-01T00:00:00.000Z"},
                    {_id: 2, title: "Story 2", updatedAt: "2020-01-01T00:00:00.000Z"},
                    {_id: 3, title: "Story 3", updatedAt: "2020-01-01T00:00:00.000Z"}
                ]
            })
        });

        expect(wrapper.findAllComponents({name: "StoryCard"}).length).to.equal(3);
    });

    it("displays the only one story card when currentStory is not null", async () => {
        store.commit("Tools/DataNarrator/setCurrentStory", {_id: 1, title: "Story 1", updatedAt: "2020"});
        const wrapper = shallowMount(DashboardPanel, wrapperOptions);

        expect(wrapper.findAllComponents({name: "StoryCard"}).length).to.equal(1);
    });
});
