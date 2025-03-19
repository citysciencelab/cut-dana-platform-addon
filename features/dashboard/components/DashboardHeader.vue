<script setup>
import LoginButton from "./Tools/LoginButton.vue";
import LanguageSwitchButton from "./Tools/LanguageSwitchButton.vue";
import CreateStoryButton from "./Tools/CreateStoryButton.vue";
import ListButton from "./Tools/ListButton.vue";
import {mdiMapLegend} from "@mdi/js";
import {useTranslation} from "i18next-vue";
import {useDashboard} from "../hooks/useDashboard";

const store = useDashboard();
const {t} = useTranslation();
const legendAdded = true;
const toggleLegend = () => {};
const isMobile = false;

</script>

<template>
    <div class="dashboard-header">
        <div class="custom-row login-row">
            <div class="d-flex justify-end align-center">
                <LoginButton />
                <LanguageSwitchButton />
            </div>
        </div>

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
                    {{ mdiMapLegend }}
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
                            src="../../../img/logonotext-xs.png"
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
                        <h1 class="header-h1">{{ t("additional:modules.dataNarrator.dashboardView.title") }}</h1>
                        <h4 class="header-h4">{{
                                t("additional:modules.dataNarrator.dashboardView.subtitle")
                            }}</h4>
                        <p>{{ t("additional:modules.dataNarrator.dashboardView.description") }}</p>
                    </v-col>
                </v-row>
            </v-col>
            <v-col
                cols="12"
                class="d-flex justify-center align-end"
            >
                <CreateStoryButton />
            </v-col>
        </v-row>

        <v-row class="list-buttons">
            <v-col class="d-flex justify-center align-center">
                <ListButton
                    v-for="[_, value] in Object.entries(store.availableStoryListModes)"
                    :key="value"
                    :mode="value"
                    :active="store.storiesDisplayMode === value"
                />
            </v-col>
        </v-row>
    </div>
</template>


<style lang="scss" scoped>
.login-row {
    top: 0;
    position: sticky;
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
    background-image: url("../../../img/cutcsl_depiction.png");

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
