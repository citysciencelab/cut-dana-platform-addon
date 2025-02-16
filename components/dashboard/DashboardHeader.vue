<script>
import {mapActions, mapGetters, mapMutations} from "vuex";
import {mdiMapLegend} from "@mdi/js";

import CreateStoryButton from "./Tools/CreateStoryButton.vue";
import LanguageSwitchButton from "./Tools/LanguageSwitchButton.vue";
import ListButton from "./Tools/ListButton.vue";
import LoginButton from "./Tools/LoginButton.vue";
import mutations from "../../../../../src/modules/legend/store/mutationsLegend";
import actions from "../../../../../src/modules/legend/store/actionsLegend";
import getters from "../../../../../src/modules/legend/store/gettersLegend";
import DataNarratorWindowMixins from "../../mixins/DataNarratorWindowMixins";

export default {
    name: "DashboardHeader",
    components: {
        LanguageSwitchButton,
        LoginButton,
        CreateStoryButton,
        ListButton
    },
    mixins: [DataNarratorWindowMixins],
    props: {
        myMode: {
            type: Boolean,
            default: false
        },
        storyListMode: {
            type: String,
            default: "all"
        }
    },
    data () {
        return {
            legendAdded: false,
            icons: {
                mdiMapLegend
            }
        };
    },
    computed: {
        ...mapGetters("Legend", Object.keys(getters))
    },
    mounted () {
    },
    methods: {
        ...mapActions("Legend", Object.keys(actions)),
        ...mapMutations("Legend", Object.keys(mutations)),
        /**
         * Returns the available story list modes.
         * @returns {string[]} The available story list modes.
         */
        availableStoryListModes () {
            const modes = ["all", "featured", "popular"];

            if (this.myMode) {
                modes.push("my");
            }
            return modes;
        },
        /**
         * Toggles the visibility of the legend
         * @returns {void}
         */
        toggleLegend () {
            this.setShowLegend(!this.showLegend);
        }
    }
};
</script>

<template>
    <div class="dashboard-header">
        <v-row class="login-row">
            <v-col class="d-flex justify-end align-center">
                <LoginButton />
                <LanguageSwitchButton />
            </v-col>
        </v-row>

        <div
            v-if="!legendAdded"
            id="dana-legend-button"
            class="row controls-row-right d-none d-md-block"
        >
            <div>
                <v-icon
                    id="dana-legend-icon"
                    class="bootstrap-icon"
                    @click="toggleLegend()"
                >
                    {{ icons.mdiMapLegend }}
                </v-icon>
            </div>
        </div>

        <v-row
            :class="`with-fancy-background ${isMobile && 'fancy-mobile'}`"
        >
            <v-col
                cols="12"
                class="d-flex justify-start align-center"
            >
                <v-row>

                    <v-col
                        lg="1"
                        md="1"
                        sm="2"
                        cols="2"
                        class="d-flex align-start justify-center"
                    >
                        <img
                            src="../../img/logonotext-xs.png"
                            alt="logo"
                            class="header-logo"
                            width="55"
                        >
                    </v-col>
                    <v-col
                        lg="4"
                        md="5"
                        sm="9"
                        cols="9"
                        class="justify-start align-start"
                    >
                        <h1 class="header-h1">{{ $t("additional:modules.dataNarrator.dashboardView.title") }}</h1>
                        <h4 class="header-h4">{{
                            $t("additional:modules.dataNarrator.dashboardView.subtitle")
                        }}</h4>
                        <p>{{ $t("additional:modules.dataNarrator.dashboardView.description") }}</p>
                    </v-col>
                </v-row>
            </v-col>
            <v-col
                cols="12"
                class="d-flex justify-center align-end"
            >
                <CreateStoryButton v-on="$listeners" />
            </v-col>
        </v-row>

        <v-row class="list-buttons">
            <v-col class="d-flex justify-center align-center">
                <ListButton
                    v-for="mode in availableStoryListModes()"
                    :key="mode"
                    :mode="mode"
                    :active="storyListMode === mode"
                    v-on="$listeners"
                />
            </v-col>
        </v-row>
    </div>
</template>


<style lang="scss" scoped>
.login-row {
    position: sticky;
    top: 0;
}

.dashboard-header {

    z-index: 112 !important;
}

#dana-legend-icon {
    background-color: white;
    padding: 0.37rem;
    border-radius: 0.25rem;
}

.with-fancy-background {
    background-position: right bottom;
    min-height: 220px;
    align-items: end;
    z-index: 112;
    background-image: url("../../img/cutcsl_depiction.png");

    @media (min-width: 768px) {
        background-position: right top;
        min-height: 332px;
    }
}

.fancy-mobile {
    margin-top: 150px !important;
}

.list-buttons {
    margin-top: 0.5rem !important;
}

.header-h1 {
    font-size: 2.5rem;
    font-weight: 700;
    text-transform: uppercase;
    color: black;
    margin-top: 0.25rem;
}

.header-h4 {
    margin-bottom: 1rem;
}

</style>
