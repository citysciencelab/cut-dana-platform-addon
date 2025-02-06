<script>
import {mapGetters, mapMutations} from "vuex";
import getters from "../store/gettersDataNarrator";
import mutations from "../store/mutationsDataNarrator";
import DataNarratorWindowMixins from "../mixins/DataNarratorWindowMixins";
import Toolwindow from "./ToolWindow/Toolwindow.vue";
import * as constants from "../store/contantsDataNarrator";
import DataNarratorDashboard from "./dashboard/Dashboard.vue";
import LoginMixin from "../mixins/LoginMixin";
import CreateStory from "./storyCreator/CreateStory.vue";

export default {
    name: "DataNarrator",
    mixins: [DataNarratorWindowMixins, LoginMixin],
    components: {CreateStory, DataNarratorDashboard, Toolwindow},
    computed: {
        ...mapGetters("Modules/DataNarrator", ["mode", "toolwindowMode"]),
        ...mapGetters("Modules/Login", ["accessToken"]),
        constants() {
            return constants;
        }
    },

    methods: {
        ...mapMutations("Modules/DataNarrator", Object.keys(mutations))
    },

    mounted() {
        this.disableMainMenu();
        this.disableSecondaryMenu();
        this.disableFooter();
    },
};
</script>

<template lang="html">
    <Teleport to="#datanarrator-root" >
        <div id="datanarrator-container" :class="[toolwindowMode]">
            <DataNarratorDashboard v-if="mode === constants.dataNarratorModes.DASHBOARD"/>
            <CreateStory v-if="mode === constants.dataNarratorModes.CREATE_STORY"/>
        </div>
    </Teleport>
</template>

<style lang="scss">
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

<style lang="scss">
.v-label, .vue-label-style, .v-expansion-panel-header, .ql-editor.ql-blank::before {
    font-size: 12px !important;
    color: #403d3d !important;
}

.v-text-field .v-label {
    padding-left: 5px;
}

.vue-label-style.label-subheader {
    margin-bottom: 10px;
}

.table-tools {
    width: 40px !important;
}

#login-component {
    left: 50% !important;
}

// Will put dashboard window into the center of the screen
.tool-window-vue {
    left: var(--currentPadding) !important;
}

#table-nav-main {
    flex: 0 0 auto;
    max-width: unset;
    padding: 5px;

    background-color: rgba(0, 0, 0, 0);
    background-color: white;
}

#table-tools, #table-category-list {
    background-color: white;
}

#table-tools-menu, #table-nav-cat-panel {
    background-color: white;
}

.icon-burgermenu_alt.collapsed::before {
    color: #73c1a9;
}

.table-nav-layers-panel {
    z-index: 10;
    background-color: white;
    box-shadow: 0 4px 8px 0 rgba(115, 193, 169, 0.0);
}

#table-nav-layers-panel-toggler {
    background-color: #f5f5f5 !important;

    .icon-cross1:before {
        color: rgba(0, 0, 0, .87) !important;
    }
}

.pill-button {
    min-width: 23px !important;
    width: 23px !important;
    margin-right: 10px;

    .v-btn__content {
        border: 2px solid #707070;
        border-radius: 10px;
        width: 10px !important;
        height: 35px;
        padding-top: 1px;
        font-size: 15px;

        .v-icon {
            height: 18px !important;
            font-size: 18px !important;
            font-weight: bold;
        }
    }
}

.pill-button.horizontal {
    min-height: 23px !important;
    height: 23px !important;
    min-width: 35px !important;
    border-radius: 10px;
    padding-left: 1px;

    .v-btn__content {
        height: 22px !important;
        width: 35px !important;
    }
}

.pill-button.horizontal.add-step {
    .v-btn__content {
        border: 2px solid #893d05;

        .v-icon {
            color: #893d05;
        }
    }
}

.pill-button.horizontal.chapter-indicator {
    .v-btn__content {
        border: none;
        color: white;
        padding-bottom: 2px;
        font-weight: bolder;
        cursor: default;
    }
}

.pill-button.step-indicator {
    .v-btn__content {
        border: 2px solid;
        background-color: white;
        padding-bottom: 2px;
        font-weight: bolder;
        cursor: default;
    }
}

.pill-button.step-indicator-big {
    width: 26px !important;

    .v-btn__content {
        height: 45px;
        border-radius: 20px;
    }
}


</style>
