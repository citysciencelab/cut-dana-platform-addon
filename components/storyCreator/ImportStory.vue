<script>
import JSZip from "jszip";
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

                zippedStory.loadAsync(e.target.result).then(function (zip) {
                    const files = Object.keys(zip.files);

                    files.forEach((relativePath) => {
                        if (relativePath === "story.json") {
                            console.log(zip.files[relativePath]);
                            zip.files[relativePath].async("string").then((fileData) => {
                                const storyJson = JSON.parse(fileData);

                                console.log(storyJson);
                            });
                        }
                    });
                });
            };
            reader.onerror = (e) => {
                this.notSaving = true;
                errorHandling(error);
                this.$root.snackB.show({
                    message: this.$t(
                        "additional:modules.tools.dataNarrator.warning.storyNotSaved"
                    ), color: "red"
                });
            };
            reader.readAsBinaryString(file);
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
                    $t(
                        "additional:modules.tools.dataNarrator.label.cover"
                    )
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
