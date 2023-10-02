<script>
import JSZip from "jszip";
import uuid from "uuid";
import * as constants from "../../store/constantsDataNarrator";
import {mapActions, mapGetters, mapMutations} from "vuex";
import mutations from "../../store/mutationsDataNarrator";
import actions from "../../store/actionsDataNarrator";
import getters from "../../store/gettersDataNarrator";
import errorHandling from "../../utils/errorHandling";
import dataURLtoFile from "../../utils/dataURLtoFile.js";

export default {
    name: "ImportStory",
    data () {
        return {
            notSaving: true
        };
    },
    computed: {
        ...mapGetters("Tools/DataNarrator", Object.keys(getters))
    },
    methods: {
        ...mapMutations("Tools/DataNarrator", Object.keys(mutations)),
        ...mapActions("Tools/DataNarrator", Object.keys(actions)),

        /**
         * Import story from file into the store
         * @returns {void}
         */
        importFromFile () {
            this.notSaving = false;
            const file = this.$refs.import_input.files[0],
                reader = new FileReader();

            reader.onload = (e) => {
                const zippedStory = new JSZip();

                zippedStory.loadAsync(e.target.result).then((zip) => {
                    const storyFile = zip.files["story.json"],
                        promises = [];

                    let titleImagePromise = Promise.resolve(null);

                    if (storyFile) {
                        storyFile.async("string").then((storyData) => {
                            const storyJson = JSON.parse(storyData),
                                story = {
                                    title: storyJson.title,
                                    description: storyJson.description,
                                    author: storyJson.author,
                                    chapters: storyJson.chapters,
                                    steps: []
                                },
                                htmlFolder = storyJson.htmlFolder || "story";

                            if (storyJson.coverImagePath) {
                                titleImagePromise = this.readAndReplaceImage(zip, storyJson.coverImagePath)
                                    .then((image) => {
                                        const filename = storyJson.coverImagePath.split("/").pop();

                                        return dataURLtoFile(image.dataUrl, filename);
                                    });
                            }

                            titleImagePromise.then((titleImage) => {
                                if (titleImage) {
                                    story.titleImage = titleImage;
                                }
                                this.setCurrentStory(story);

                                storyJson.steps.forEach(stepJson => {
                                    promises.push(this.prepareStep(zip, stepJson, htmlFolder));
                                });


                                Promise.all(promises).then(() => {
                                    this.setCurrentStoryId(null);
                                    this.setMode(constants.storyTellingModes.CREATE);
                                    this.$root.snackB.show({
                                        message: this.$t(
                                            "additional:modules.tools.dataNarrator.success.storyImported"
                                        ), color: "green"
                                    });
                                });

                            });
                        });
                    }
                    else {
                        throw new Error("No story.json file found in zip");
                    }
                });
            };
            reader.onerror = (error) => {
                this.notSaving = true;
                errorHandling(error);
                this.$root.snackB.show({
                    message: this.$t(
                        "additional:modules.tools.dataNarrator.warning.storyNotImported"
                    ), color: "red"
                });
            };
            reader.readAsBinaryString(file);
        },
        prepareStep (zip, stepJson, htmlFolder) {
            const step = {
                    _id: uuid.v4(),
                    stepNumber: stepJson.stepNumber,
                    stepWidth: stepJson.stepWidth,
                    associatedChapter: stepJson.associatedChapter,
                    title: stepJson.title,
                    centerCoordinate: stepJson.centerCoordinate,
                    zoomLevel: stepJson.zoomLevel,
                    layers: stepJson.layers,
                    interactionAddons: stepJson.interactionAddons,
                    visible: stepJson.visible
                },
                htmlFile = zip.files[[htmlFolder, stepJson.htmlFile].join("/")];

            if (htmlFile) {
                return htmlFile.async("string").then((htmlData) => {
                    return this.prepareHtmlImages(zip, htmlData);
                }).then(([html, images]) => {
                    step.html = html;
                    this.saveStoryStep({step: step, images: images});
                });
            }
            return Promise.resolve(this.saveStoryStep({step: step, images: []}));
        },
        prepareHtmlImages (zip, htmlData) {
            const parser = new DOMParser(),
                html = parser.parseFromString(htmlData, "text/html"),
                images = html.getElementsByTagName("img"),
                promises = [];

            for (let i = 0; i < images.length; i++) {
                const image = images[i],
                    src = image.getAttribute("src");

                if (src && !(src.startsWith("http://") || src.startsWith("https://"))) {
                    const encodedImage = src;

                    if (!src.startsWith("data:")) {
                        promises.push(this.readAndReplaceImage(zip, src, image));
                    }
                    else if (encodedImage) {
                        promises.push(Promise.resolve(encodedImage));
                    }

                }
            }

            return Promise.all(promises).then((preparedImages) => [html.body.innerHTML, preparedImages]);
        },
        readAndReplaceImage (zip, src, image = null) {
            const imageType = src.split(".").pop(),
                imagePath = src.split("/");

            if (imagePath[0] === ".") {
                imagePath.shift();
            }
            if (imagePath[0] === "assets") {
                imagePath.shift();
            }

            // eslint-disable-next-line one-var
            const imageFile = zip.files[imagePath.join("/")];

            if (imageFile) {
                return imageFile.async("base64").then((imageData) => {
                    const encodedImage = `data:image/${imageType};base64,${imageData}`;

                    if (image) {
                        image.setAttribute("src", encodedImage);
                    }

                    return {dataUrl: encodedImage, fileExtension: imageType};
                });
            }
            return Promise.resolve(null);
        }
    }
};
</script>

<template>
    <div>
        <v-progress-linear
            v-if="!notSaving"
            indeterminate
            height="10"
            striped
            rounded
            color="lime"
        />

        <div v-if="notSaving">
            <label
                class="form-label"
                for="import"
            >
                {{
                    $t("additional:modules.tools.dataNarrator.label.importStory")
                }}
            </label>
            <v-row id="import-row">
                <v-col cols="11">
                    <input
                        id="import"
                        ref="import_input"
                        type="file"
                        name="import"
                        class="form-control"
                        accept=".zip"
                        @change="importFromFile()"
                    >
                </v-col>
                <v-col cols="1">
                    <v-tooltip left>
                        <template #activator="{ on }">
                            <v-icon
                                id="create-button"
                                class="mr-1"
                                @click="$emit('closeImportForm')"
                                v-on="on"
                            >
                                cancel
                            </v-icon>
                        </template>
                        <span>
                            {{
                                $t("additional:modules.tools.dataNarrator.cancel")
                            }}
                        </span>
                    </v-tooltip>
                </v-col>
            </v-row>
        </div>
    </div>
</template>
