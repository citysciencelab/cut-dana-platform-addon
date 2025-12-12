<script setup>
import { mdiPlus } from '@mdi/js';
import { useTranslation } from 'i18next-vue';

import { useDataNarrator } from '../../../../hooks/useDataNarrator';
import { dataNarratorModes } from '../../../../store/contantsDataNarrator';
import { useLogin } from '../../hooks/useLogin';

const { t } = useTranslation();
const { loggedIn } = useLogin();
const { gotoPage } = useDataNarrator();

const createStory = async () => {
    gotoPage(dataNarratorModes.CREATE_STORY);
};
</script>

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
    {{ t("additional:modules.dataNarrator.create") }}
  </v-btn>
</template>

