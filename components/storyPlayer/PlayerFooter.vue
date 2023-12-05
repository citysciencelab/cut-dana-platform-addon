<script>

import {mapGetters} from "vuex";
import getters from "../../store/gettersDataNarrator";

export default {
    name: "PlayerFooter",
    model: {
        prop: "currentStepIndex",
        event: "change"
    },
    props: {
        currentStepIndex: {
            type: Number,
            default: null
        }
    },
    computed: {
        ...mapGetters("Tools/DataNarrator", Object.keys(getters)),
        stepLength () {
            return this.currentStory.steps.length;
        }
    }
};
</script>

<template>
    <div
        id="tool-dataNarrator-navigation"
        class="d-flex justify-content-between"
    >
        <div class="d-flex">
            <div class="d-flex justify-content-center align-items-center">
                {{ currentStepIndex + 1 }} / {{ stepLength }}
            </div>
        </div>

        <div class="d-flex align-items-center">
            <v-btn
                v-if="currentStepIndex > 0"
                class="mx-2"
                text
                rounded
                @click="$emit('change', currentStepIndex - 1)"
            >
                {{ $t("additional:modules.tools.dataNarrator.button.previous") }}
            </v-btn>

            <v-btn
                v-if="currentStepIndex < stepLength - 1"
                class="mx-2"
                dark
                rounded
                @click="$emit('change', currentStepIndex + 1)"
            >
                {{ $t("additional:modules.tools.dataNarrator.button.next") }}
            </v-btn>
        </div>
    </div>
</template>
