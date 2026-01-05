<script setup>

import { mdiLogin, mdiLogout } from '@mdi/js';
import { useTranslation } from 'i18next-vue';

import { createLogger } from '../../../../utils/logger.js';
import { useLogin } from '../../hooks/useLogin';

const { loggedIn, openLoginWindow, checkLoggedIn, logout } = useLogin();
const { t } = useTranslation();

checkLoggedIn();
const logger = createLogger('CoverSelector');

const loginLogoutAction = () => {
  logger.debug('logging in or out', loggedIn.value);
  if (loggedIn.value) {
    logout();
    return;
  }

  openLoginWindow();
}
</script>

<template>
  <v-btn
    rounded
    size="small"
    elevation="0"
    @click="loginLogoutAction()"
  >
    <v-icon small>
      {{ loggedIn ? mdiLogout : mdiLogin }}
    </v-icon>
    {{
      loggedIn ?
        t("common:modules.login.logout") :
        t("common:modules.login.login")
    }}
  </v-btn>
</template>

