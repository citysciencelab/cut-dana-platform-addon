import {expect} from "chai";
import mutations from "../../../store/mutationsDataNarrator";

const {applyTranslationKey} = mutations;

describe("addons/DataNarrator/store/mutationsDataNarrator", function () {
    describe("applyTranslationKey", function () {
        it("removes 'translate#' from name if present", function () {
            const state = {
                    name:
                        "translate#additional:modules.tools.dataNarrator.title"
                },
                payload =
                    "translate#additional:modules.tools.dataNarrator.title";

            applyTranslationKey(state, payload);
            expect(state.name).to.equals(
                "additional:modules.tools.dataNarrator.title"
            );
        });

        it("does nothing, if name not starts with 'translate#'", function () {
            const name = "dies ist ein DataNarrator",
                state = {
                    name: name
                },
                payload = name;

            applyTranslationKey(state, payload);
            expect(state.name).to.equals(name);
        });

        it("does nothing, if payload is undefined", function () {
            const name = "name",
                state = {
                    name: name
                },
                payload = undefined;

            applyTranslationKey(state, payload);
            expect(state.name).to.equals(name);
        });
    });
});
