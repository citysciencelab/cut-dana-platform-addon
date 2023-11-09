import {expect} from "chai";
import {shallowMount} from "@vue/test-utils";

import StoryPlayer from "../../../../components/storyPlayer/StoryPlayer.vue";
import {emptyStory, emptyStep} from "../../../../store/constantsDataNarrator";

import {wrapperOptions, testStore} from "../../vue_helpers";

describe("StoryPlayer", () => {

    const newStory = {...emptyStory, chapters: [], steps: [emptyStep, emptyStep, emptyStep]};

    it("renders a ClassicPlayer component when showMode is 'classic'", async () => {
        testStore.commit("Tools/DataNarrator/setCurrentStory", {...newStory, displayType: "classic"});
        const wrapper = await shallowMount(StoryPlayer, {
            ...wrapperOptions,
            propsData: {
                isPreview: false,
                stepIndex: 0
            },
            computed: {
                backgroundMaps () {
                    return [];
                }
            }
        });

        expect(wrapper.find("classicplayer-stub").exists()).to.be.true;
        expect(wrapper.find("scrollyteller-stub").exists()).to.be.false;
    });

    it("renders a ScrollyTeller component when showMode is 'scrolly'", async () => {
        testStore.commit("Tools/DataNarrator/setCurrentStory", {...newStory, displayType: "scrolly"});
        const wrapper = await shallowMount(StoryPlayer, {
            ...wrapperOptions,
            propsData: {
                isPreview: false,
                stepIndex: 0
            },
            computed: {
                backgroundMaps () {
                    return [];
                }
            }
        });

        expect(wrapper.find("classicplayer-stub").exists()).to.be.false;
        expect(wrapper.find("scrollyteller-stub").exists()).to.be.true;
    });

    it("sets the currentStepIndex to the value of the stepIndex prop", () => {
        testStore.commit("Tools/DataNarrator/setCurrentStory", newStory);
        const wrapper = shallowMount(StoryPlayer, {
            ...wrapperOptions,
            propsData: {
                isPreview: false,
                stepIndex: 2
            },
            computed: {
                backgroundMaps () {
                    return [];
                }
            }
        });

        expect(wrapper.vm.currentStepIndex).to.equal(2);
    });
});
