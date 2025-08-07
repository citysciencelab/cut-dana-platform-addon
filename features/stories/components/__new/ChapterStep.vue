<script setup>
import {useTranslation} from "i18next-vue";
import {mdiEye, mdiTrashCan, mdiMapMarkerPlusOutline, mdiChevronRight} from "@mdi/js";

import StepTitle from "./step/StepTitle.vue";
import StepDescription from "./step/StepDescription.vue";
import TwoDNavigation from "./step/TwoDNavigation.vue";
import BackgroundMap from "./step/BackgroundMap.vue";

const {step} = defineProps({
    step: {
        type: Object,
        required: true
    }
});

const {t} = useTranslation();
</script>

<template>
    <div class="chapter-step px-2 pt-1 pb-2">
        <v-row class="mb-2" align="center">
            <v-col cols="1" class="p-0">
                <v-btn variant="text" class="pill-button">
                    {{ step.id }}
                </v-btn>
            </v-col>

            <v-col cols="11" class="p-0">
                <StepTitle v-model:value="step.title" />
            </v-col>
        </v-row>

        <v-row class="mb-2">
            <v-col cols="12" class="p-0">
                <StepDescription v-model:value="step.description" />
            </v-col>
        </v-row>

        <v-row>
            <v-col cols="12" class="p-0">
                {{ t( "additional:modules.dataNarrator.label.mapDisplay" ) }}
            </v-col>
        </v-row>

        <TwoDNavigation v-model="step.mapConfig" />

        <v-row class="mb-2">
            <v-col cols="12" class="p-0">
                <BackgroundMap />
            </v-col>
        </v-row>

        <v-row class="mb-1">
            <v-col cols="12" class="p-0">
                Informationsebenen
            </v-col>
        </v-row>

        <v-row class="mb-2" style="margin-top: 0!important;">
            <v-col cols="12" class="p-0">
                <v-text-field
                    variant="outlined"
                    density="comfortable"
                    value="Wasserwerte"
                    :prepend-inner-icon="mdiEye"
                    :append-inner-icon="mdiTrashCan"
                    hide-details
                />
            </v-col>
        </v-row>

        <v-row class="mb-2" justify="center">
            <v-btn
                variant="flat"
                size="small"
                color="#b8e6c2"
                :prepend-icon="mdiMapMarkerPlusOutline"
                :append-icon="mdiChevronRight"
                rounded
            >
                Informationsebene hinzufügen
            </v-btn>
        </v-row>
    </div>
</template>

<style lang="scss">
.chapter-step {
    background-color: white;
    border-radius: 15px;
    margin-top: 10px;

    .pill-button {
        .v-btn__content {
            width: 20px !important;
        }
    }
}
</style>
