import {expect} from "chai";
import sinon from "sinon";
import axios from "axios";

import actions from "../../../../store/actionsDataNarrator.js";
// import * as getDataUrlFromFile from "../../../../utils/getDataUrlFromFile.js";

describe("addons/dataNarrator/store/actions/storyCreatorActions.js", () => {

    const fakeImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFDQJcG5Q3DwAAAABJRU5ErkJggg==";
    let commit, state, postStoryImageStub, getDataUrlFromFileStub, postStepDatasourceStub, axiosPatchStub, axiosPostStub;

    beforeEach(() => {
        commit = sinon.spy();
        state = {
            backendConfig: {
                url: "http://localhost:3000"
            },
            currentStory: {
                title: "Test Story",
                steps: [
                    {
                        _id: "step_1-1",
                        associatedChapter: 1,
                        stepNumber: 1,
                        title: "Step 1",
                        html: "<h1>Step 1</h1>"
                    },
                    {
                        _id: "step_1-2",
                        associatedChapter: 1,
                        stepNumber: 2,
                        title: "Step 2",
                        html: "<h1>Step 2</h1>"
                    }
                ]
            },
            htmlContentsImages: {
                "step_1-1": [
                    {dataUrl: fakeImage, fileExtension: "png"},
                    {dataUrl: fakeImage, fileExtension: "png"}
                ],
                "step_1-2": [{dataUrl: fakeImage, fileExtension: "png"}]
            },
            htmlContents: {
                "step_1-1": "<h1>Chapter 1 Step 1<h1>",
                "step_1-2": "<h1>Chapter 1 Step 2<h1>"
            }
        };
        postStoryImageStub = sinon.stub().resolves();
        getDataUrlFromFileStub = sinon.stub().resolves(fakeImage);
        postStepDatasourceStub = sinon.stub().resolves();
        axiosPatchStub = sinon.stub(axios, "patch").resolves();
        axiosPostStub = sinon.stub(axios, "post").resolves();
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("uploadStoryFiles", () => {
        it("uploads a new story with images and datasources", async () => {
            const response = {
                data: {
                    storyId: "5678"
                }
            };

            axiosPostStub.onFirstCall().resolves(response);

            await actions.uploadStoryFiles({state});

            expect(axiosPostStub.callCount).to.equal(4); // 1 for story, 3 for images
            expect(axiosPostStub.getCall(0).args[0]).to.eql({
                url: "http://localhost:3000/stories",
                data: {
                    title: "Test Story",
                    steps: [
                        {
                            associatedChapter: 1,
                            stepNumber: 1,
                            title: "Step 1"
                        },
                        {
                            associatedChapter: 1,
                            stepNumber: 2,
                            title: "Step 2"
                        }
                    ]
                }
            });

            expect(axiosPatchStub.callCount).to.equal(2); // 2 for steps html
            expect(axiosPatchStub.getCall(0).args[0]).to.eql("http://localhost:3000/stories/5678/1/1/html");
            expect(axiosPatchStub.getCall(0).args[1]).to.eql({html: "<h1>Step 1</h1>"});
            expect(axiosPatchStub.getCall(1).args[0]).to.eql("http://localhost:3000/stories/5678/1/2/html");
            expect(axiosPatchStub.getCall(1).args[1]).to.eql({html: "<h1>Step 2</h1>"});
        });

        it("updates an existing story with images and datasources", async () => {
            const response = {
                data: {
                    storyId: "5678"
                }
            };

            state.currentStoryId = 5678;
            axiosPatchStub.onFirstCall().resolves(response);
            await actions.uploadStoryFiles({state});

            expect(axiosPostStub.callCount).to.equal(3); // 3 for images

            expect(axiosPatchStub.callCount).to.equal(3); // 1 for story, 2 for steps html
            expect(axiosPatchStub.getCall(0).args[0]).to.eql({
                url: "http://localhost:3000/stories/5678",
                data: {
                    title: "Test Story",
                    steps: [
                        {
                            associatedChapter: 1,
                            stepNumber: 1,
                            title: "Step 1"
                        },
                        {
                            associatedChapter: 1,
                            stepNumber: 2,
                            title: "Step 2"
                        }
                    ]
                }
            });

            expect(axiosPatchStub.getCall(1).args[0]).to.eql("http://localhost:3000/stories/5678/1/1/html");
            expect(axiosPatchStub.getCall(1).args[1]).to.eql({html: "<h1>Step 1</h1>"});
            expect(axiosPatchStub.getCall(2).args[0]).to.eql("http://localhost:3000/stories/5678/1/2/html");
            expect(axiosPatchStub.getCall(2).args[1]).to.eql({html: "<h1>Step 2</h1>"});
        });
    });
});
