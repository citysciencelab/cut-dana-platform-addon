import {expect} from "chai";
import {shallowMount} from "@vue/test-utils";

import SnackBar from "../../../components/SnackBar.vue";

import {localVue} from "../vue_helpers";

describe("SnackBar.vue", () => {
    it("renders the message passed in show()", async () => {
        const message = "Test message",
            wrapper = shallowMount(SnackBar, {localVue});

        await wrapper.vm.show({message});

        expect(wrapper.text()).to.include(message);
    });

    it("renders the default icon if no icon in show() is passed", async () => {
        const wrapper = shallowMount(SnackBar, {localVue});

        await wrapper.vm.show({});
        expect(wrapper.text()).to.include("mdi-check");
    });

    it("renders the icon passed as a prop in show()", async () => {
        const icon = "mdi-alert",
            wrapper = shallowMount(SnackBar, {localVue});

        await wrapper.vm.show({icon});
        expect(wrapper.text()).to.include(icon);
    });

    it("renders the default color if no color prop is passed", async () => {
        const wrapper = shallowMount(SnackBar, {localVue});

        await wrapper.vm.show({});
        expect(wrapper.attributes("color")).to.equal("primary");
    });

    it("renders the color passed as a prop", async () => {
        const color = "error",
            wrapper = shallowMount(SnackBar, {localVue});

        await wrapper.vm.show({color});
        expect(wrapper.attributes("color")).to.equal(color);
    });

    it("renders the default timeout if no timer prop is passed", async () => {
        const wrapper = shallowMount(SnackBar, {localVue});

        await wrapper.vm.show({});
        expect(wrapper.attributes("timeout")).to.eql("3000");
    });

    it("renders the timeout passed as a prop", async () => {
        const timer = 5000,
            wrapper = shallowMount(SnackBar, {localVue});

        await wrapper.vm.show({timer});
        expect(wrapper.attributes("timeout")).to.eql(timer.toString());
    });

    it("hides the snackbar by default", () => {
        const wrapper = shallowMount(SnackBar, {localVue});

        expect(wrapper.vm.showSnackbar).to.be.false;
    });

    it("shows the snackbar when the show method is called", () => {
        const wrapper = shallowMount(SnackBar, {localVue});

        wrapper.vm.show({message: "Test message"});
        expect(wrapper.vm.showSnackbar).to.be.true;
    });
});
