<template>
  <v-row
    v-if="!is3d"
    class="mb-2"
  >
    <v-col
      cols="3"
      class="d-flex align-self-center pr-1"
    >
      <v-text-field
        id="step-center-lng"
        v-model="centerCoordinates[0]"
        disabled
        outlined
        dense
        class="vue-text-all-top small-fieldset"
        :class="{'position_change': centerCoordinates && centerCoordinates !== center}"
        :label="t(
          'additional:modules.dataNarrator.label.longitude'
        )"
        :title="t(
          'additional:modules.dataNarrator.label.longitude'
        )"
        hide-details
      />
    </v-col>
    <v-col
      cols="3"
      class="d-flex align-self-center"
    >
      <v-text-field
        id="step-center-lat"
        v-model="centerCoordinates[1]"
        disabled
        outlined
        dense
        class="vue-text-all-top small-fieldset"
        :class="{'position_change': centerCoordinates && centerCoordinates !== center}"
        :label="t(
          'additional:modules.dataNarrator.label.latitude'
        )"
        :title="t(
          'additional:modules.dataNarrator.label.latitude'
        )"
        hide-details
      />
    </v-col>
    <v-col
      cols="1"
      class="d-flex justify-center align-self-start"
    >
      <v-btn
        icon
        :title="
          t(
            'additional:modules.dataNarrator.label.centerCoordinate'
          )
        "
        @click="() => {
          centerCoordinates = center
        }"
      >
        <v-icon>{{ mdiPinOutline }}</v-icon>
      </v-btn>
    </v-col>
    <v-col
      cols="3"
      offset="1"
      class="d-flex align-self-center"
    >
      <v-text-field
        id="step-zoomlevel"
        v-model="zoomLevel"
        disabled
        outlined
        dense
        class="vue-text-all-top small-fieldset"
        :class="{'position_change': zoomLevel && zoomLevel !== zoom}"
        :label="t('additional:modules.dataNarrator.label.zoomLevel')"
        hide-details
      />
    </v-col>
    <v-col
      cols="1"
      class="d-flex justify-center align-self-start"
    >
      <v-btn
        icon
        :title="t('additional:modules.dataNarrator.label.setZoomLevel')"
        @click="() => {zoomLevel = zoom}"
      >
        <v-icon>{{ mdiPinOutline }}</v-icon>
      </v-btn>
    </v-col>
  </v-row>
</template>
<script setup>

import { mdiPinOutline } from '@mdi/js';

import { useTranslation } from 'i18next-vue';

import { useNavigation } from '../hooks/useNavigation';
import { useStepForm } from '../hooks/useStepForm';

const { t } = useTranslation();
const { is3d, zoomLevel, centerCoordinates } = useStepForm();
const { zoom, center } = useNavigation();
console.log('zoom', zoom, 'center', center)
console.log('zoomLevel', zoomLevel !== zoom, 'centerCoordinates', centerCoordinates !== center)
</script>

<style scoped lang="scss">
.position_change :deep(.v-label) {
    color: red !important;
}
</style>
