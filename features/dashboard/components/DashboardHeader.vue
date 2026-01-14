<script setup>
import { mdiMapLegend } from '@mdi/js';
import { useTranslation } from 'i18next-vue';
import { computed } from 'vue';
import { useStore } from 'vuex';

import { useDataNarrator } from '../../../hooks/useDataNarrator';
import cutcslDepiction from '../../../img/cutcsl_depiction.png';
import { availableStoryListModes, ToolwindowModes } from '../../../store/contantsDataNarrator';
import { createLogger } from '../../../utils/logger.js';
import { useLogin } from '../hooks/useLogin';

import CreateStoryButton from './Tools/CreateStoryButton.vue';
import LanguageSwitchButton from './Tools/LanguageSwitchButton.vue';
import ListButton from './Tools/ListButton.vue';
import LoginButton from './Tools/LoginButton.vue';
import UserMenu from './Tools/UserMenu.vue';

const store = useStore();

const logger = createLogger('DashboardHeader');

const { t } = useTranslation();

const storiesDisplayMode = computed(() => store.state.Modules.DataNarrator.DashboardStore.mode);
const { toolwindowMode } = useDataNarrator()
const { loggedIn } = useLogin();
const storyModeLists = computed(() => {
  return Object.values(availableStoryListModes).filter(mode =>
    loggedIn.value || mode !== 'my'
  );
});

const legendAdded = true;

const toggleLegend = () => logger.debug('toggleLegend');

const getBackgroundStyle = () => ({
  backgroundImage: `url(${cutcslDepiction})`
});
</script>

<template>
  <div
    class="with-fancy-background"
    :style="getBackgroundStyle()"
  >
    <Teleport
      v-if="toolwindowMode === ToolwindowModes.MOBILE"
      to="body"
    >
      <div
        class="login-row-mobile"
      >
        <div
          class="settings-menu"
        >
          <UserMenu v-if="loggedIn" />
        </div>
        <div class="d-flex justify-end align-center ga-2">
          <LoginButton />
          <LanguageSwitchButton />
        </div>
      </div>
    </Teleport>
    <div
      v-else
      class="login-row"
    >
      <div
        class="settings-menu"
      >
        <UserMenu v-if="loggedIn" />
      </div>
      <div class="d-flex justify-end align-center ga-2">
        <LoginButton />
        <LanguageSwitchButton />
      </div>
    </div>

    <div
      v-if="!legendAdded"
      id="dana-legend-button"
      class="row controls-row-right d-none d-md-block"
    >
      <div>
        <v-icon
          id="dana-legend-icon"
          class="bootstrap-icon"
          @click="toggleLegend()"
        >
          {{ mdiMapLegend }}
        </v-icon>
      </div>
    </div>

    <v-row>
      <v-col
        lg="4"
        md="5"
        sm="12"
        cols="12"
        offset-lg="2"
        offset-md="2"
        offset-sm="0"
        class="justify-start align-start header-col"
      >
        <h1 class="header-h1">
          <img
            src="../../../img/logonotext-xs.png"
            alt="logo"
            class="header-logo"
          >
          {{ t("additional:modules.dataNarrator.dashboardView.title") }}
        </h1>
        <h4 class="header-h4">
          {{ t("additional:modules.dataNarrator.dashboardView.subtitle") }}
        </h4>
        <p class="header-body">
          {{ t("additional:modules.dataNarrator.dashboardView.description") }}
        </p>
      </v-col>
    </v-row>
    <v-row>
      <v-col
        cols="12"
        class="d-flex justify-center align-end"
      >
        <CreateStoryButton />
      </v-col>
    </v-row>

    <v-row class="list-buttons">
      <v-col class="d-flex justify-center align-center">
        <ListButton
          v-for="value in storyModeLists"
          :key="value"
          :mode="value"
          :active="storiesDisplayMode === value"
        />
      </v-col>
    </v-row>
  </div>
</template>


<style lang="scss" scoped>
.login-row-mobile,
.login-row {
  display: flex;
  align-items: center;
  top: 8px;
}

.login-row-mobile {
  position: fixed;
  width: calc(100% - 16px);
  left: 8px;
  z-index: 2000;
}

.login-row {
  margin: 8px 8px 0 8px;
  position: sticky;
  z-index: 1000;
}

.settings-menu {
  flex: 1;
}

.header-col {
  padding-top: 6rem;
  padding-bottom: 3rem;
  background-color: rgba(255, 255, 255, 0.5);
}

#dana-legend-icon {
  background-color: white;
  padding: 0.37rem;
  border-radius: 0.25rem;
}

.with-fancy-background {
  background-position: -50% -50%;

  @media (min-width: 768px) {
    background-position: 80%;
    background-size: 50%;
  }
}

.list-buttons {
  margin-top: 0.5rem !important;
}

.header-h1 {
  position: relative;
  font-weight: 600;
  text-transform: uppercase;
  color: black;
  margin-top: 0.25rem;

  img {
    position: absolute;
    height: 1em;
    top: -1.2em;

    @media (min-width: 768px) {
      left: -1.5em;
      top: unset;
    }
  }
}

.header-h4 {
  margin-bottom: 1rem;
  font-size: 16px;
  font-weight: 600;
}

.header-body {
  font-size: 14px;
  font-weight: 500;
  line-height: 16px;
  text-align: justify;
}
</style>
