import { computed } from 'vue';
import { useStore } from 'vuex';

import Cookie from '../../../../../../src/modules/login/js/utilsCookies';
import OIDC from '../../../../../../src/modules/login/js/utilsOIDC';

import { FetchInterceptor } from '../../../api/FetchInterceptor';
import { useDataNarrator } from '../../../hooks/useDataNarrator';
import { backendUrl } from '../../../store/contantsDataNarrator';
import { createLogger } from '../../../utils/logger.js';
import { getRedirectUrl } from '../../login/services/loginService';

let tokenRenewalTimer = null;

const logger = createLogger('useLogin');

export function useLogin() {
  const { moveTool } = useDataNarrator();

  const store = useStore();

  const accessToken = computed(() => store.state.Modules.Login.accessToken);
  const loggedIn = computed(() => store.state.Modules.Login.loggedIn);
  const email = computed(() => store.state.Modules.Login.email);
  const screenName = computed(() => store.state.Modules.Login.screenName);
  const username = computed(() => store.state.Modules.Login.username);
  const userId = computed(() => store.state.Modules.Login.userId);

  const getAuthCodeUrl = async () => {
    return getRedirectUrl();
  }

  const logout = async () => {
    if (tokenRenewalTimer) {
      clearInterval(tokenRenewalTimer);
      tokenRenewalTimer = null;
    }

    const idToken = Cookie.get('id_token');

    store.dispatch('Modules/Login/logout');

    if (idToken) {
      await frontChannelLogout(idToken);
    }
  }

  const frontChannelLogout = async (idToken) => {
    try {
      if (!idToken) {
        throw new Error('ID token is required for front channel logout');
      }

      const response = await fetch(`${backendUrl}/auth/config`);

      if (!response.ok) {
        throw new Error('Error while fetching OIDC config for logout');
      }

      const config = await response.json();

      if (!config || !config.authUri) {
        throw new Error('authUri not found in OIDC config');
      }

      // Construct the front channel logout url based on the auth url, the logout
      // url is usually the auth url with /logout instead of /auth.
      // Example: https://keycloak.domain/auth/realms/MY_REALM/protocol/openid-connect/logout
      const logoutUri = config.authUri.replace(/\/auth$/, '/logout');

      const logoutParams = new URLSearchParams({
        id_token_hint: idToken,
        // Redirect back to the application after logout.
        post_logout_redirect_uri: `${window.location.origin}${window.location.pathname}`
      });

      // Redirect to Keycloak logout.
      window.location.href = `${logoutUri}?${logoutParams.toString()}`;
    } catch (error) {
      logger.error('Error during logout: ', error);
    }
  }

  const startTokenRenewalTimer = () => {
    if (tokenRenewalTimer) {
      clearInterval(tokenRenewalTimer);
    }

    // Check token expiry and renew every 30 seconds
    tokenRenewalTimer = setInterval(async () => {
      const config = Config.login;
      const token = Cookie.get('token');
      const refreshToken = Cookie.get('refresh_token');

      if (!token || !refreshToken) {
        clearInterval(tokenRenewalTimer);
        tokenRenewalTimer = null;
        return;
      }

      const expiry = OIDC.getTokenExpiry(token);

      if (expiry < 1) {
        clearInterval(tokenRenewalTimer);
        tokenRenewalTimer = null;
        logout();
        return;
      }

      // Renew token if necessary (OIDC.renewTokenIfNecessary handles the 60s threshold)
      await OIDC.renewTokenIfNecessary(token, refreshToken, config);

      const updatedToken = Cookie.get('token');
      if (updatedToken !== token) {
        store.commit('Modules/Login/setAccessToken', updatedToken);
        FetchInterceptor.setHeader('Authorization', `Bearer ${updatedToken}`);
      }
    }, 10_000);
  }

  const openLoginWindow = async () => {
    if (!loggedIn.value) {
      const params = 'width=500,height=500,status=no,location=no,menubar=no,' +
        `top=${window.screenY + (window.outerHeight - 500) / 2.5},` +
        `left=${window.screenX + (window.outerWidth - 500) / 2}`;

      const loginPopup = window.open(await getAuthCodeUrl(), 'login', params);

      const timer = setInterval(() => {
        checkLoggedIn();
        if (loggedIn.value) {
          loginPopup.close();
          clearInterval(timer);
          moveTool();
          startTokenRenewalTimer();
        }
      }, 100);
    }
  }

  const checkLoggedIn = async () => {
    const config = Config.login,
      token = Cookie.get('token'),
      refreshToken = Cookie.get('refresh_token');

    let localLoggedIn = false;

    store.commit('Modules/Login/setAccessToken', token);

    FetchInterceptor.setHeader(
      'Authorization',
      `Bearer ${token}`
    );
    store.commit('Modules/Login/setRefreshToken', refreshToken);

    if (OIDC.getTokenExpiry(token) < 1) {
      logout();
      return false;
    }

    OIDC.renewTokenIfNecessary(token, refreshToken, config);

    localLoggedIn = Boolean(token);

    store.commit('Modules/Login/setLoggedIn', localLoggedIn);

    store.commit('Modules/Login/setScreenName', Cookie.get('name'));
    store.commit('Modules/Login/setUsername', Cookie.get('username'));
    store.commit('Modules/Login/setEmail', Cookie.get('email'));

    const meRes = await fetch(`${backendUrl}/me`);
    if (meRes.ok) {
      const res = await meRes.json();
      store.commit('Modules/Login/setUserId', res.id);
    }

    if (localLoggedIn && !tokenRenewalTimer) {
      startTokenRenewalTimer();
    }

    return loggedIn;
  }

  return {
    accessToken,
    loggedIn,
    email,
    screenName,
    username,
    openLoginWindow,
    logout,
    checkLoggedIn,
    userId,
  }
}
