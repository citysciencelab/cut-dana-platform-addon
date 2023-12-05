<script>
import BackButton from "../shared/BackButton.vue";
import TableOfContentsButton from "../shared/TableOfContentsButton.vue";

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
    }
};
</script>

<template>
    <div>
        <v-row>
            <v-col>
                <BackButton
                    tooltip="additional:modules.tools.dataNarrator.button.cancel"
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
