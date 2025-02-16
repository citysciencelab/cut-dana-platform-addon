<script>
import {mapActions, mapMutations, mapState} from "vuex";
import {mdiPlus} from "@mdi/js";

import mutations from "../../../store/mutationsDataNarrator";
import actions from "../../../store/actionsDataNarrator";
import NavigationMixins from "../../../mixins/NavigationMixins";
import {dataNarratorModes} from "../../../store/contantsDataNarrator";

export default {
    name: "CreateStoryButton",
    data () {
        return {
            icons: {
                mdiPlus
            }
        };
    },
    mixins: [NavigationMixins],
    methods: {
        ...mapMutations("Modules/DataNarrator", Object.keys(mutations)),
        ...mapActions("Modules/DataNarrator", Object.keys(actions)),
    },
    computed: {
        ...mapState("Modules/Login", [
            "loggedIn"
        ]),
        dataNarratorModes() {
            return dataNarratorModes
        }
    }
};
</script>

<template>
    <v-btn
        v-if="loggedIn"
        outlined
        rounded
        small
        @click="() => gotoPage(dataNarratorModes.CREATE_STORY)"
    >
        <v-icon small>
            {{ icons.mdiPlus }}
        </v-icon>
        {{
            $t("additional:modules.dataNarrator.create")
        }}
    </v-btn>
</template>
