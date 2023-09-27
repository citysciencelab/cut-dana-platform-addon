<script>
import JSZip from "jszip";
import uuid from "uuid";
import * as constants from "../../store/constantsDataNarrator";
import {mapActions, mapGetters, mapMutations} from "vuex";
import mutations from "../../store/mutationsDataNarrator";
import actions from "../../store/actionsDataNarrator";
import getters from "../../store/gettersDataNarrator";
import errorHandling from "../../utils/errorHandling";

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
                    const storyFile = zip.files["story.json"];

                    if (storyFile) {
                        storyFile.async("string").then((storyData) => {
                            const storyJson = JSON.parse(storyData),
                                story = {
                                    title: storyJson.title,
                                    description: storyJson.description,
                                    author: storyJson.author,
                                    chapters: storyJson.chapters,
                                    steps: []
                                };

                            if (storyJson.coverImagePath) {
                                console.log("coverImagePath", storyJson.coverImagePath);
                                story.titleImage = this.readAndReplaceImage(zip, storyJson.coverImagePath);
                                console.log("story.titleImage", story.titleImage);
                            }

                            this.setCurrentStory(story);

                            storyJson.steps.forEach(stepJson => this.prepareStep(zip, stepJson));
                        });
                        this.setCurrentStoryId(null);
                        this.setMode(constants.storyTellingModes.CREATE);
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
        prepareStep (zip, stepJson) {
            const step = {
                    _id: uuid.v4(),
                    stepNumber: stepJson.stepNumber,
                    stepWidth: stepJson.stepWidth,
                    associatedChapter: stepJson.associatedChapter,
                    title: stepJson.title,
                    centerCoordinate: stepJson.centerCoordinate,
                    zoomLevel: stepJson.zoomLevel,
                    layers: stepJson.layers,
                    interactionAddons: stepJson.interactionAddons
                },

                htmlFile = zip.files[`story/${stepJson.htmlFile}`];
            let images = [];

            if (htmlFile) {
                htmlFile.async("string").then((htmlData) => {
                    [step.html, images] = this.prepareHtmlImages(zip, htmlData);
                });
            }

            // storyCreatorActions.js
            this.saveStoryStep({step: step, images: images});
        },
        prepareHtmlImages (zip, htmlData) {
            const parser = new DOMParser(),
                html = parser.parseFromString(htmlData, "text/html"),
                images = html.getElementsByTagName("img"),
                preparedImages = [];

            for (let i = 0; i < images.length; i++) {
                const image = images[i],
                    src = image.getAttribute("src");

                if (src && !(src.startsWith("http://") || src.startsWith("https://"))) {
                    const encodedImage = src.startsWith("data:")
                        ? src
                        : this.readAndReplaceImage(zip, src, image);

                    if (encodedImage) {
                        preparedImages.push(encodedImage);
                    }
                }
            }

            return [html.body.innerHTML, preparedImages];
        },
        readAndReplaceImage (zip, src, image = null) {
            const imageType = src.split(".").pop(),
                imagePath = src.split("/").pop(),
                imageFile = zip.files[`story/images/${imagePath}`];

            if (imageFile) {
                imageFile.async("base64").then((imageData) => {
                    const encodedImage = `data:image/${imageType};base64,${imageData}`;

                    if (image) {
                        image.setAttribute("src", encodedImage);
                    }
                    console.log("imageFile", imageFile);

                    return encodedImage;
                });
            }
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
