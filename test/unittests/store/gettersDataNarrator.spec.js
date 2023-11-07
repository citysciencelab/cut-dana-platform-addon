import {expect} from "chai";
import getters from "../../../store/gettersDataNarrator";
import stateDataNarrator from "../../../store/stateDataNarrator";

const {
    id,
    htmlContentsImages,
    active,
    name,
    glyphicon,
    renderToWindow,
    resizableWindow,
    isVisibleInMenu,
    deactivateGFI,
    initialWidth,
    initialWidthMobile
} = getters;

describe("addons/DataNarrator/store/gettersDataNarrator", function () {
    it("returns the id from state", function () {
        expect(id(stateDataNarrator)).to.equals("dataNarrator");
    });
    it("returns the htmlContentsImages from state", function () {
        expect(
            JSON.stringify(htmlContentsImages(stateDataNarrator))
        ).to.equals(JSON.stringify({}));
    });

    describe("testing default values", function () {
        it("returns the active default value from state", function () {
            expect(active(stateDataNarrator)).to.be.false;
        });
        it("returns the name default value from state", function () {
            expect(name(stateDataNarrator)).to.be.equals(
                "Story Telling Tool"
            );
        });
        it("returns the glyphicon default value from state", function () {
            expect(glyphicon(stateDataNarrator)).to.equals(
                "glyphicon-book"
            );
        });
        it("returns the renderToWindow default value from state", function () {
            expect(renderToWindow(stateDataNarrator)).to.be.true;
        });
        it("returns the resizableWindow default value from state", function () {
            expect(resizableWindow(stateDataNarrator)).to.be.true;
        });
        it("returns the isVisibleInMenu default value from state", function () {
            expect(isVisibleInMenu(stateDataNarrator)).to.be.true;
        });
        it("returns the deactivateGFI default value from state", function () {
            expect(deactivateGFI(stateDataNarrator)).to.be.false;
        });
        it("returns the initialWidth default value from state", function () {
            expect(initialWidth(stateDataNarrator)).to.equals(500);
        });
        it("returns the initialWidthMobile default value from state", function () {
            expect(initialWidthMobile(stateDataNarrator)).to.equals(300);
        });
    });
});
