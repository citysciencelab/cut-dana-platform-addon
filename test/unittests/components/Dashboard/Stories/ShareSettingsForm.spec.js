import {expect} from "chai";
import {mount} from "@vue/test-utils";
import axios from "axios";
import sinon from "sinon";

import ShareSettingsForm from "../../../../../components/Dashboard/Stories/ShareSettingsForm.vue";
import {localVue, testStore} from "../../../vue_helpers";

describe("ShareSettingsForm", () => {
    let wrapper;

    beforeEach(() => {
        wrapper = mount(ShareSettingsForm, {
            localVue,
            store: testStore,
            stubs: {
                "VIcon": true,
                "ShareSettings": true
            },
            propsData: {
                story: {
                    _id: "123",
                    title: "Test Story",
                    author: "Test Author",
                    description: "Test Description",
                    owner: "testuser",
                    private: false,
                    sharedWith: ["testuser"]
                }
            }
        });
    });

    it("renders the form", () => {
        expect(wrapper.find("sharesettings-stub")).to.exist;
    });

    it("emits the correct event when the form is submitted", () => {
        wrapper.find("#reset-button button").trigger("click");
        expect(wrapper.emitted("close:shared-settings").length).to.equal(1);
    });

    it("displays an error message when the form is submitted with invalid data", () => {
        const axiosPatchStub = sinon.stub(axios, "patch").resolves();

        wrapper.find("#save-button button").trigger("click");
        expect(axiosPatchStub.callCount).to.equal(1);
    });
});
