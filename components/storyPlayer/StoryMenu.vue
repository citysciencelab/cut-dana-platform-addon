<script>
import {EventEmitter} from "../../utils/EventEmitter";
import actions from "../../store/actionsDataNarrator";
import getters from "../../store/gettersDataNarrator";
import mutations from "../../store/mutationsDataNarrator";
import {mapActions, mapGetters, mapMutations} from "vuex";

export default {
    name: "StoryMenu",
    props: {
        initialAutoPlay: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            isScrollytelling: false,
            isAutoPlay: false
        };
    },
    computed: {
        ...mapGetters("Tools/DataNarrator", Object.keys(getters))
    },
    created () {
        this.isAutoPlay = this.initialAutoPlay;
    },
    methods: {
        ...mapMutations("Tools/DataNarrator", Object.keys(mutations)),
        ...mapActions("Tools/DataNarrator", Object.keys(actions)),
        reset () {
            EventEmitter.$emit("resetStory");
        },
        toggleAutoPlay () {
            this.isAutoPlay = !this.isAutoPlay;
            EventEmitter.$emit("toggleAutoPlay");
        },
        toggleScrollytelling () {
            this.isScrollytelling = !this.isScrollytelling;
            EventEmitter.$emit("toggleScrollytelling");
        }
    }
};
</script>

<template>
    <div id="story-menu">
        <span
            v-if="storyConf?.displayType && storyConf.displayType === 'scrolly'"
            class="scrolly-button"
            role="button"
            tabindex="0"
            @click="toggleScrollytelling"
            @keydown="toggleScrollytelling"
        >
            <v-icon>style</v-icon>
        </span>
        <span
            v-if="mode && storyConf.storyInterval"
        >
            <span
                role="button"
                tabindex="0"
                @click="toggleAutoPlay"
                @keydown="toggleAutoPlay"
            >
                <v-tooltip left>
                    <template #activator="{ on, attrs }">
                        <v-icon
                            :color="isAutoPlay ? '#66afe9' : ''"
                            v-bind="attrs"
                            v-on="on"
                        >timer
                        </v-icon>
                    </template>
                    <span>
                        {{
                            $t("additional:modules.tools.dataNarrator.label.autoPLay")
                        }}
                        {{
                            isAutoPlay ? $t("additional:modules.tools.dataNarrator.label.off") :
                            $t("additional:modules.tools.dataNarrator.label.on")
                        }}
                    </span>
                </v-tooltip>
            </span>
        </span>
        <span
            role="button"
            tabindex="0"
            @click="reset"
            @keydown="reset"
        >
            <v-tooltip left>
                <template #activator="{ on, attrs }">
                    <v-icon
                        v-bind="attrs"
                        v-on="on"
                    >keyboard_backspace
                    </v-icon>
                </template>
                <span>reset</span>
            </v-tooltip>
        </span>
    </div>
</template>

<style lang="scss" scoped>
#story-menu {
    position: absolute;
    width: 100%;
    text-align: end;

    .v-icon {
        font-size: 1.3rem;
        cursor: pointer;
    }
}

</style>
