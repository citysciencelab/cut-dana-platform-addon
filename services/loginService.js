import OIDC from "../../../../src/modules/login/js/utilsOIDC";
import * as constants from "../store/contantsDataNarrator";

export const getRedirectUrl = async () => {

    const response = await fetch(`${constants.backendUrl}/auth/config`);
    const json = await response.json();

    const config = {
            oidcTokenEndpoint: json.tokenUri,
            oidcClientId: json.clientId,
            oidcRedirectUri: json.redirectUri,
            interceptorUrlRegex: Config.login.interceptorUrlRegex,
            oidcScope: json.scope,
            oidcAuthorizationEndpoint: json.authUri
        },
        oidcAuthorizationEndpoint = config.oidcAuthorizationEndpoint || "oidcAuthorizationEndpoint_not_defined_in_config.js",
        oidcClientId = config.oidcClientId || "oidcClientId_not_defined_in_config.js",
        oidcRedirectUri = config.oidcRedirectUri || "oidcRedirectUri_not_defined_in_config.js",
        oidcScope = config.oidcScope || "oidcScope_not_defined_in_config.js",

        url = await OIDC.getAuthCodeUrl(oidcAuthorizationEndpoint, oidcClientId, oidcRedirectUri, oidcScope);

    return url;

    // return "http://localhost:8000/auth/login"
}
