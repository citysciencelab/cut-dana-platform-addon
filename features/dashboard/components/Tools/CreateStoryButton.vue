<template>
    <v-btn
        v-if="loggedIn"
        variant="outlined"
        rounded
        size="small"
        @click="createStory"
    >
        <v-icon small>
            {{ mdiPlus }}
        </v-icon>
        {{
            t("additional:modules.dataNarrator.create")
        }}
    </v-btn>
</template>
<script setup>
import {mdiPlus} from "@mdi/js";
import {useTranslation} from "i18next-vue";
import {useLogin} from "../../hooks/useLogin";
import {useDataNarrator} from "../../../../hooks/useDataNarrator";
import {dataNarratorModes} from "../../../../store/contantsDataNarrator";
import {useStoryForm} from "../../../stories/hooks/useStoryForm";

const {t} = useTranslation();
const {loggedIn} = useLogin();
const {gotoPage} = useDataNarrator();
const {createDraftStory} = useStoryForm();

const createStory = async () => {
    await createDraftStory();
    gotoPage(dataNarratorModes.CREATE_STORY);
};


</script>
