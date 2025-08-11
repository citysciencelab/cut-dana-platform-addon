<script setup>
import DataNarratorDashboard from "./features/dashboard/components/Dashboard.vue";
import * as constants from "./store/contantsDataNarrator";
import CreateStory from "./features/stories/components/CreateStory.vue";
import {useDataNarrator} from "./hooks/useDataNarrator";
import PlayStory from "./features/stories/components/__new/PlayStory.vue";

defineOptions({
    name: "DataNarrator"
});

const {disableFooter, disableMainMenu, disableSecondaryMenu, toolwindowMode, mode} = useDataNarrator();

disableFooter();
disableMainMenu();
disableSecondaryMenu();
</script>

<template lang="html">
    <Teleport to="#datanarrator-root">
        <div
            id="datanarrator-container"
            :class="[toolwindowMode]"
        >
            <DataNarratorDashboard v-if="mode === constants.dataNarratorModes.DASHBOARD" />
            <CreateStory v-if="mode === constants.dataNarratorModes.CREATE_STORY" />
            <PlayStory v-if="mode === constants.dataNarratorModes.PLAY_STORY" />
        </div>
    </Teleport>
</template>

<style lang="scss">
@import "./css/toolwindow.scss";
@import "./css/vuetify_fixes.scss";
@import "./css/fixes.scss";
@import "./css/globals.scss";
#datanarrator-root {
    pointer-events: none;
    position: absolute;
    top: 0;

    #datanarrator-container {
        width: 100vw;
        height: 100vh;
        overflow: hidden;

        display: grid;
        grid-template-columns: 12rem auto 12rem;

        position: relative;

        &.mobile {
            grid-template-columns: 0 auto 0 !important;
        }

        &.dashboard {
            grid-template-columns: 12rem auto 12rem !important;
        }

        &.desktop {
            grid-template-columns: 30rem auto 0 !important;
            padding-left: 1rem !important;
        }
    }
}
</style>

