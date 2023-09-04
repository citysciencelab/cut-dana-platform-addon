<script>
import * as constants from "../../store/constantsDataNarrator";
import {mapActions, mapGetters, mapMutations} from "vuex";
import mutations from "../../store/mutationsDataNarrator";
import actions from "../../store/actionsDataNarrator";
import getters from "../../store/gettersDataNarrator";

export default {
    name: "StaticStorySelector",
    props: {
        storyId: {
            type: Number,
            default: null
        }
    },
    data () {
        return {
            constants
        };
    },
    computed: {
        ...mapGetters("Tools/DataNarrator", Object.keys(getters))
    },
    mounted () {

        // We need to alter the tool window corresponding to the uiStyle
        let toolWindowClass = "tool-window-vue";

        if (this.uiStyle === "TABLE") {
            toolWindowClass = "table-tool-win-all-vue";
        }
        const toolWindow = document.getElementsByClassName(toolWindowClass)[0],
            heading = toolWindow.getElementsByClassName("title")[0],
            winHeading = toolWindow.getElementsByClassName("win-heading")[0],
            dataNarratorReset = document.getElementById("tool-dataNarrator-reset"),
            tableNavigation = document.getElementById("table-navigation"),
            toolContentBody = document.getElementById("vue-tool-content-body"),
            dashboardWidth = 1050;


        if (dataNarratorReset) {
            dataNarratorReset.style = "display: none;";
        }
        if (tableNavigation) {
            tableNavigation.style = "display: none;";
        }
        if (toolContentBody) {
            // toolContentBody.style = "background-color: rgba(255, 255, 255, 0.5);";
            // toolWindow.style = "background-color: rgba(255, 255, 255, 0.5);";
        }
        heading.innerHTML = this.$t("additional:modules.tools.dataNarrator.dashboardView.title");
        winHeading.style.setProperty("background-color", "white", "important");
        winHeading.style.setProperty("height", "12px");
        winHeading.style.setProperty("border-bottom", "none");

        toolWindow.style.setProperty("--initialToolWidth", dashboardWidth + "px", "important");
        toolWindow.style.setProperty("left", "calc(50% - " + dashboardWidth / 2 + "px)");
    },
    methods: {
        ...mapMutations("Tools/DataNarrator", Object.keys(mutations)),
        ...mapActions("Tools/DataNarrator", Object.keys(actions)),

        /**
         * Changes the story that is selected
         * @param {String} storyUrl - The url of the story
         * @returns {void}
         */
        onStorySelected (storyUrl) {
            window.open(
                storyUrl,
                "_blank"
            );
        }
    }
};
</script>

<template>
    <div>
        <v-row id="title-row">
            <v-col
                id="title-element"
                class="text-h5"
                cols="11"
            >
                {{
                    $t("additional:modules.tools.dataNarrator.dashboardView.title")
                }}
            </v-col>
            <v-col cols="1">
                <v-tooltip left>
                    <template #activator="{ on }">
                        <v-icon
                            id="info-button"
                            class="mr-1"
                            v-on="on"
                        >
                            info
                        </v-icon>
                    </template>
                    <span>
                        Some important Info
                    </span>
                </v-tooltip>
            </v-col>
        </v-row>
        <v-row
            id="content-row"
        >
            <div class="pa-2 col-4">
                <v-card class="card d-flex">
                    <img
                        src="https://raw.githubusercontent.com/herzogrh/faircare-verkehr/main/assets/img/stroller-1.jpg"
                        height="200px"
                        alt="stroller-1.jpg"
                    >
                    <v-card-title class="title">
                        FairCare Verkehr
                    </v-card-title>
                    <v-card-subtitle>
                        Eine Story für das erste Realexperiment des CSL im Rahmen des CUT-Projektes über die
                        Mobilitätsbedarfe von unbezahlten Carearbeiter*innen.
                    </v-card-subtitle>
                    <v-row class="align-self-end">
                        <v-col
                            cols="12"
                            align-self="end"
                        >
                            <v-card-actions class="story-play">
                                <v-btn
                                    text
                                    @click="onStorySelected('../mobility-data/')"
                                >
                                    {{
                                        $t("additional:modules.tools.dataNarrator.play")
                                    }}
                                </v-btn>
                            </v-card-actions>
                        </v-col>
                    </v-row>
                </v-card>
            </div>
            <div class="pa-2 col-4">
                <v-card class="card d-flex">
                    <img
                        src="story-assets/result-story-cover.png"
                        height="200px"
                        alt="result-story-cover.png"
                    >
                    <v-card-title class="title">
                        FairCare Verkehr Ergebnisse
                    </v-card-title>
                    <v-card-subtitle>
                        Diese Story zeigt den Prozess und die Ergebnisse der ersten beiden Realexperiment des City
                        Science
                        Labs zu den Mobilitätsbedarfen von unbezahlten Carearbeiter*innen.
                    </v-card-subtitle>
                    <v-row class="align-self-end">
                        <v-col
                            cols="12"
                            align-self="end"
                        >
                            <v-card-actions class="story-play">
                                <v-btn
                                    text
                                    @click="onStorySelected('../mobility-results/')"
                                >
                                    {{
                                        $t("additional:modules.tools.dataNarrator.play")
                                    }}
                                </v-btn>
                            </v-card-actions>
                        </v-col>
                    </v-row>
                </v-card>
            </div>
            <div class="pa-2 col-4">
                <v-card class="card d-flex">
                    <img
                        src="story-assets/3d-story-cover.png"
                        height="200px"
                        alt="3d-story-cover.png"
                    >
                    <v-card-title class="title">
                        3D Story Test
                    </v-card-title>
                    <v-card-subtitle>
                        Diese Story soll die Funktionalitäten des 3D Modus im Data Narrator veranschaulichen
                    </v-card-subtitle>
                    <v-row class="align-self-end">
                        <v-col
                            cols="12"
                            align-self="end"
                        >
                            <v-card-actions class="story-play">
                                <v-btn
                                    text
                                    @click="onStorySelected('../3d-test/')"
                                >
                                    {{
                                        $t("additional:modules.tools.dataNarrator.play")
                                    }}
                                </v-btn>
                            </v-card-actions>
                        </v-col>
                    </v-row>
                </v-card>
            </div>
            <!--            <div class="pa-2 col-3">-->
            <!--                <v-card class="card d-flex">-->
            <!--                    <img-->
            <!--                        src="https://static.leipzig.de/fileadmin/_processed_/c/f/csm_Radfahren-in-Leipzig_d7a94db175.jpg"-->
            <!--                        height="200px"-->
            <!--                        alt="Radfahren-in-Leipzig_d7a94db175.jpg"-->
            <!--                    >-->
            <!--                    <v-card-title class="title">-->
            <!--                        Leipzigs Datenstory zum Radverkehr-->
            <!--                    </v-card-title>-->
            <!--                    <v-row class="align-self-end">-->
            <!--                        <v-col-->
            <!--                            cols="12"-->
            <!--                            align-self="end"-->
            <!--                        >-->
            <!--                            <v-card-actions class="story-play">-->
            <!--                                <v-btn-->
            <!--                                    text-->
            <!--                                    @click="onStorySelected('https://localhost:9001/portal/radverkehr-leipzig/')"-->
            <!--                                >-->
            <!--                                    {{-->
            <!--                                        $t("additional:modules.tools.dataNarrator.play")-->
            <!--                                    }}-->
            <!--                                </v-btn>-->
            <!--                            </v-card-actions>-->
            <!--                        </v-col>-->
            <!--                    </v-row>-->
            <!--                </v-card>-->
            <!--            </div>-->
        </v-row>
    </div>
</template>


<style lang="scss" scoped>
#title-row {
    padding-bottom: 10px;

    #title-element {
        padding-left: calc(var(--bs-gutter-x) * 0.5);
    }

    #info-button {
        float: right;
    }
}

#content-row {
    .card {
        height: 100%;
    }

    .title {
        word-break: break-word !important;
    }

    .story-play {
        //position: absolute;
        //bottom: 0;
    }
}
</style>
