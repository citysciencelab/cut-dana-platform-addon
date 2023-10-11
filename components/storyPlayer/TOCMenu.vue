<script>
import actions from "../../store/actionsDataNarrator";
import getters from "../../store/gettersDataNarrator";
import mutations from "../../store/mutationsDataNarrator";
import {mapActions, mapGetters, mapMutations} from "vuex";

export default {
    name: "TOCMenu",
    props: {

        currentStepIndex: {
            type: Number,
            default: 0
        }
    },
    data () {
        return {

        };
    },
    computed: {
        ...mapGetters("Tools/DataNarrator", Object.keys(getters))
    },

    methods: {
        ...mapMutations("Tools/DataNarrator", Object.keys(mutations)),
        ...mapActions("Tools/DataNarrator", Object.keys(actions)),

        scrollToStep (stepIndex) {
            document.getElementsByClassName("stepper")[stepIndex].scrollIntoView({lock: "center"});
            this.$parent.$emit("close-toc");
        }
    }
};
</script>

<template>
    <div id="TOC-menu">
        <span
            role="button"
            tabindex="0"
            @click="scrollToStep(currentStepIndex)"
            @keydown="scrollToStep(currentStepIndex)"
        >
            <v-tooltip left>
                <template #activator="{ on, attrs }">
                    <v-icon
                        v-bind="attrs"
                        v-on="on"
                    >close
                    </v-icon>
                </template>
                <span>close</span>
            </v-tooltip>
        </span>
    </div>
</template>

<style lang="scss" scoped>
#TOC-menu {
    position: absolute;
    width: 100%;
    text-align: end;

    .v-icon {
        font-size: 1.3rem;
        cursor: pointer;
    }
}

</style>
