<script>
import BackButton from "../shared/BackButton.vue";
import TableOfContentsButton from "../shared/TableOfContentsButton.vue";
import getters from "../../store/gettersDataNarrator";
import {mapGetters} from "vuex";
import {mdiDotsVertical} from "@mdi/js";

export default {
    name: "PlayerHeader",
    components: {
        BackButton,
        TableOfContentsButton
    },
    props: {
        chapter: {
            type: Object,
            default: null
        }
    },
    data () {
        return {
            icons: {
                mdiDotsVertical
            }
        };
    },
    computed: {
        ...mapGetters("Modules/DataNarrator", Object.keys(getters))
    },
    methods: {
        activateScrollyTelling (step) {
            this.$emit("activateScrollyTelling", step);
        },
        activateAutoPlay (step) {
            this.$emit("activateAutoPlay", step);
        }
    }
};
</script>

<template>
    <div>
        <v-row class="mb-1">
            <v-col
                cols="6"
                class="d-flex justify-content-start align-self-center"
            >
                <BackButton
                    tooltip="additional:modules.tools.dataNarrator.button.cancel"
                    :text="currentStory.title"
                    @click="$emit('reset')"
                />
            </v-col>
            <v-col
                class="d-flex align-self-center justify-content-end"
                cols="6"
            >
                <v-menu
                    offset-y
                    left
                >
                    <template #activator="{ on, attrs }">
                        <v-btn
                            icon
                            v-bind="attrs"
                            v-on="on"
                        >
                            <v-icon>
                                {{ icons.mdiDotsVertical }}
                            </v-icon>
                        </v-btn>
                    </template>
                    <!-- TODO: Wenn das Menu so bestehen bleibt, den Code für die click actions aus der PLayerFooter.vue importieren -->
                    <v-list-item
                        class="header-menu-item"
                        @click="activateScrollyTelling(step)"
                    >
                        <v-list-item-title>
                            {{ $t("additional:modules.tools.dataNarrator.label.scrollMode") }}
                        </v-list-item-title>
                    </v-list-item>
                    <v-list-item
                        class="header-menu-item"
                        @click="activateAutoPlay(step)"
                    >
                        <v-list-item-title>
                            {{ $t("additional:modules.tools.dataNarrator.label.autoPLay") }}
                        </v-list-item-title>
                    </v-list-item>
                </v-menu>
            </v-col>
        </v-row>

        <v-row>
            <v-col>
                <TableOfContentsButton
                    :chapter="chapter"
                    @click="$emit('click')"
                />
            </v-col>
        </v-row>
    </div>
</template>

<style lang="scss" scoped>
.header-menu-item {
    min-height: 35px;
    .v-list-item__title {
        font-size: 0.9rem;
    }
}
</style>
