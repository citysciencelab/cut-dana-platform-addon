<template>
<!--    <v-row-->
<!--        v-if="is3d && cesiumEnabled"-->
<!--        class="mb-2"-->
<!--    >-->
<!--        <v-col-->
<!--            cols="3"-->
<!--            class="d-flex align-self-center mr-2"-->
<!--        >-->
<!--            <v-text-field-->
<!--                id="step-center-3d-0"-->
<!--                :value="navigation3D.heading"-->
<!--                disabled-->
<!--                outlined-->
<!--                dense-->
<!--                class="vue-text-all-top small-fieldset"-->
<!--                :class="{'positon_change': mapMovedPosition.heading && step.navigation3D.heading && step.navigation3D.heading !== mapMovedPosition.heading}"-->
<!--                :label="t(-->
<!--                                'additional:modules.dataNarrator.label.heading'-->
<!--                            )"-->
<!--                :title="t(-->
<!--                                'additional:modules.dataNarrator.label.heading'-->
<!--                            )"-->
<!--                hide-details-->
<!--            />-->
<!--        </v-col>-->
<!--        <v-col-->
<!--            cols="1"-->
<!--            class="d-flex align-self-center mr-2"-->
<!--        >-->
<!--            <v-btn-->
<!--                icon-->
<!--                :title="-->
<!--                                t(-->
<!--                                    'additional:modules.dataNarrator.label.heading'-->
<!--                                )-->
<!--                            "-->
<!--                @click="step.navigation3D.heading = get3DMapCenter()['heading']"-->
<!--            >-->
<!--                <v-icon>{{ mdiPinOutline }}</v-icon>-->
<!--            </v-btn>-->
<!--        </v-col>-->
<!--        <v-col-->
<!--            cols="3"-->
<!--            class="d-flex align-self-center"-->
<!--        >-->
<!--            <v-text-field-->
<!--                id="step-center-3d-0"-->
<!--                :value="step.navigation3D.pitch"-->
<!--                disabled-->
<!--                outlined-->
<!--                dense-->
<!--                class="vue-text-all-top small-fieldset"-->
<!--                :class="{'positon_change': mapMovedPosition.pitch && step.navigation3D.pitch && step.navigation3D.pitch !== mapMovedPosition.pitch}"-->
<!--                :label="t(-->
<!--                                'additional:modules.dataNarrator.label.pitch'-->
<!--                            )"-->
<!--                :title="t(-->
<!--                                'additional:modules.dataNarrator.label.pitch'-->
<!--                            )"-->
<!--                hide-details-->
<!--            />-->
<!--        </v-col>-->
<!--        <v-col-->
<!--            cols="1"-->
<!--            class="d-flex align-self-center"-->
<!--        >-->
<!--            <v-btn-->
<!--                icon-->
<!--                :title="-->
<!--                                t(-->
<!--                                    'additional:modules.dataNarrator.label.pitch'-->
<!--                                )-->
<!--                            "-->

<!--                @click="step.navigation3D.pitch = get3DMapCenter()['pitch']"-->
<!--            >-->
<!--                <v-icon>{{ mdiPinOutline }}</v-icon>-->
<!--            </v-btn>-->
<!--        </v-col>-->
<!--    </v-row>-->
</template>
<script setup>
// import { mdiPinOutline } from '@mdi/js';
// import { useTranslation } from 'i18next-vue';
// import { useStepForm } from '../hooks/useStepForm';
//
// const { t } = useTranslation();
// const { step, cesiumEnabled, get3DMapCenter, mapMovedPosition, is3d } = useStepForm();
// const { step } = useStepForm();
</script>
