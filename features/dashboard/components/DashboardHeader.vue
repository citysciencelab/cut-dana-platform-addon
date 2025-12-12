<script setup>
import {storeToRefs} from "pinia";
import {mdiMapLegend} from "@mdi/js";
import {useTranslation} from "i18next-vue";

import LoginButton from "./Tools/LoginButton.vue";
import LanguageSwitchButton from "./Tools/LanguageSwitchButton.vue";
import CreateStoryButton from "./Tools/CreateStoryButton.vue";
import ListButton from "./Tools/ListButton.vue";
import {useDashboard} from "../hooks/useDashboard";
import {useDashboardStore} from "../store/useDashboardStore";
import cutcslDepiction from "../../../img/cutcsl_depiction.png";
import {ToolwindowModes} from "../../../store/contantsDataNarrator";
import {useDataNarrator} from "../../../hooks/useDataNarrator";

const {t} = useTranslation();
const {storyModeLists} = useDashboard();
const dashboardStore = useDashboardStore();
const {toolwindowMode} = useDataNarrator()

const {mode: storiesDisplayMode} = storeToRefs(dashboardStore)
const legendAdded = true;

const toggleLegend = () => {
    console.log("toggleLegend");
};

const getBackgroundStyle = () => ({
    backgroundImage: `url(${cutcslDepiction})`
});
</script>

<template>
    <div class="with-fancy-background" :style="getBackgroundStyle()">
        <Teleport v-if="toolwindowMode === ToolwindowModes.MOBILE" to="body">
            <div class="login-row-mobile">
                <div class="d-flex justify-end align-center mt-2 ga-2">
                    <LoginButton/>
                    <LanguageSwitchButton/>
                </div>
            </div>
        </Teleport>
        <div v-else class="login-row">
            <div class="d-flex justify-end align-center mt-2 ga-2">
                <LoginButton/>
                <LanguageSwitchButton/>
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

        <v-row>
            <v-col
                lg="4"
                md="5"
                sm="12"
                cols="12"
                offset-lg="2"
                offset-md="2"
                offset-sm="0"
                class="justify-start align-start header-col"
            >
                <h1 class="header-h1">
                    <img
                        src="../../../img/logonotext-xs.png"
                        alt="logo"
                        class="header-logo"
                    >
                    {{ t("additional:modules.dataNarrator.dashboardView.title") }}
                </h1>
                <h4 class="header-h4">
                    {{ t("additional:modules.dataNarrator.dashboardView.subtitle") }}
                </h4>
                <p class="header-body">{{ t("additional:modules.dataNarrator.dashboardView.description") }}</p>
            </v-col>
        </v-row>
        <v-row>
            <v-col
                cols="12"
                class="d-flex justify-center align-end"
            >
                <CreateStoryButton/>
            </v-col>
        </v-row>

        <v-row class="list-buttons">
            <v-col class="d-flex justify-center align-center">
                <ListButton
                    v-for="value in storyModeLists"
                    :key="value"
                    :mode="value"
                    :active="storiesDisplayMode === value"
                />
            </v-col>
        </v-row>
    </div>
</template>


<style lang="scss" scoped>
.login-row-mobile {
    position: fixed;
    top: 10px;
    right: 10px;
    z-index: 2000;
}

.login-row {
    top: 10px;
    position: sticky;
}

.header-col {
    padding-top: 6rem;
    padding-bottom: 3rem;
    background-color: rgba(255, 255, 255, 0.5);
}

#dana-legend-icon {
    background-color: white;
    padding: 0.37rem;
    border-radius: 0.25rem;
}

.with-fancy-background {
    background-position: -50% -50%;

    @media (min-width: 768px) {
        background-position: 80%;
        background-size: 50%;
    }
}

.list-buttons {
    margin-top: 0.5rem !important;
}

.header-h1 {
    position: relative;
    font-weight: 600;
    text-transform: uppercase;
    color: black;
    margin-top: 0.25rem;

    img {
        position: absolute;
        height: 1em;
        top: -1.2em;

        @media (min-width: 768px) {
            left: -1.5em;
            top: unset;
        }
    }
}

.header-h4 {
    margin-bottom: 1rem;
    font-size: 16px;
    font-weight: 600;
}

.header-body {
    font-size: 14px;
    line-height: 16px;
    font-weight: 500;
}
</style>
