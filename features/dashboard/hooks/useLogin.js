import {computed} from "vue";
import {useStore} from "vuex";
import {getRedirectUrl} from "../../login/services/loginService";
import {useDashboard} from "./useDashboard";
import Cookie from "../../../../../../src/modules/login/js/utilsCookies";
import OIDC from "../../../../../../src/modules/login/js/utilsOIDC";

export function useLogin () {
    const {moveTool} = useDashboard();

    const store = useStore();

    const accessToken = computed(() => store.state.Modules.Login.accessToken);
    const loggedIn = computed(() => store.state.Modules.Login.loggedIn);
    const email = computed(() => store.state.Modules.Login.email);
    const screenName = computed(() => store.state.Modules.Login.screenName);
    const username = computed(() => store.state.Modules.Login.username);

    const getAuthCodeUrl = async () => {
        return getRedirectUrl();
    }

    const logout = () => {
        store.dispatch("Modules/Login/logout");
    }

    const openLoginWindow = async () => {
        if (!loggedIn.value) {
            const params = "width=500,height=500,status=no,location=no,menubar=no," +
                    `top=${window.screenY + (window.outerHeight - 500) / 2.5},` +
                    `left=${window.screenX + (window.outerWidth - 500) / 2}`;

            const loginPopup = window.open(await getAuthCodeUrl(), "login", params);

            const timer = setInterval(() => {
                checkLoggedIn();
                if (loggedIn.value) {
                    loginPopup.close();
                    clearInterval(timer);
                    moveTool();
                }
            }, 100);
        }
    }

    const checkLoggedIn = () => {

        const config = Config.login,
            token = Cookie.get("token"),
            refreshToken = Cookie.get("refresh_token");

        let localLoggedIn = false;

        store.commit("Modules/Login/setAccessToken", token);
        store.commit("Modules/Login/setRefreshToken", refreshToken);

        if (OIDC.getTokenExpiry(token) < 1) {
            logout();
            return false;
        }

        OIDC.renewTokenIfNecessary(token, refreshToken, config);

        localLoggedIn = Boolean(token);

        store.commit("Modules/Login/setLoggedIn", localLoggedIn);

        store.commit("Modules/Login/setScreenName", Cookie.get("name"));
        store.commit("Modules/Login/setUsername", Cookie.get("username"));
        store.commit("Modules/Login/setEmail", Cookie.get("email"));

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
        checkLoggedIn
    }
}
