import {expect} from "chai";
import {shallowMount, mount} from "@vue/test-utils";
import {
    mdiAccountArrowDown,
    mdiSortClockAscendingOutline,
    mdiPlaylistStar,
    mdiSortDescending
} from "@mdi/js";

import ListButton from "../../../../../components/Dashboard/Tools/ListButton.vue";
import {wrapperOptions} from "../../../vue_helpers";

describe("ListButton.vue", () => {
    it("renders the correct icon for mode 'my'", () => {
        const wrapper = shallowMount(ListButton, {
            ...wrapperOptions,
            propsData: {
                mode: "my",
                currentMode: null
            }
        });

        expect(wrapper.vm.icon()).to.equal(mdiAccountArrowDown);
    });

    it("renders the correct icon for mode 'featured'", () => {
        const wrapper = shallowMount(ListButton, {
            ...wrapperOptions,
            propsData: {
                mode: "featured",
                currentMode: null
            }
        });

        expect(wrapper.vm.icon()).to.equal(mdiPlaylistStar);
    });

    it("renders the correct icon for mode 'popular'", () => {
        const wrapper = shallowMount(ListButton, {
            ...wrapperOptions,
            propsData: {
                mode: "popular",
                currentMode: null
            }
        });

        expect(wrapper.vm.icon()).to.equal(mdiSortDescending);
    });

    it("renders the correct icon for default mode", () => {
        const wrapper = shallowMount(ListButton, {
            ...wrapperOptions,
            propsData: {
                mode: null,
                currentMode: null
            }
        });

        expect(wrapper.vm.icon()).to.equal(mdiSortClockAscendingOutline);
    });

    it("sets the color to 'info' when currentMode matches mode", () => {
        const wrapper = mount(ListButton, {
            ...wrapperOptions,
            stubs: {
                "VIcon": true
            },
            propsData: {
                mode: "my",
                currentMode: "my"
            }
        });

        expect(wrapper.find("vicon-stub").attributes("color")).to.equal("info");
    });

    it("does not set the color to 'info' when currentMode does not match mode", () => {
        const wrapper = mount(ListButton, {
            ...wrapperOptions,
            stubs: {
                "VIcon": true
            },
            propsData: {
                mode: "my",
                currentMode: "featured"
            }
        });

        expect(wrapper.find("vicon-stub").attributes("color")).to.equal("");
    });
});
