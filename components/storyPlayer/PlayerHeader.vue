<script>
import BackButton from "../shared/BackButton.vue";
import TableOfContentsButton from "../shared/TableOfContentsButton.vue";
import getters from "../../store/gettersDataNarrator";
import {mapGetters} from "vuex";

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
    computed: {
        ...mapGetters("Tools/DataNarrator", Object.keys(getters))
    }
};
</script>

<template>
    <div>
        <v-row>
            <v-col>
                <BackButton
                    tooltip="additional:modules.tools.dataNarrator.button.cancel"
                    :text="currentStory.title"
                    @click="$emit('reset')"
                />
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
