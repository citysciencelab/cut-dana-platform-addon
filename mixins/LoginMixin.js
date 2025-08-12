import {mapActions, mapGetters, mapMutations, mapState} from "vuex";
import getters from "../store/gettersDataNarrator";
import mutations from "../store/mutationsDataNarrator";
import {getRedirectUrl} from "../services/loginService";
import DataNarratorWindowMixins from "./DataNarratorWindowMixins";

export default {
    mixins: [DataNarratorWindowMixins],
    data () {
        return {
            timer: null, mappedAccessToken: undefined
        };
    },
    computed: {
        ...mapGetters("Modules/DataNarrator", Object.keys(getters)),
        ...mapGetters("Modules/Login", ["loggedIn", "screenName", "email", "iconLogin", "iconLogged"]),
        ...mapState("Modules/Login", ["accessToken"])
    },
    watch: {

    },
    mounted() {
        this.checkLoggedIn();
    },
    methods: {
        ...mapMutations("Modules/DataNarrator", Object.keys(mutations)),
        ...mapMutations("Modules/Login", ["setIcon"]),
        ...mapActions("Modules/Login", [
            "initialize",
            "logout",
            "checkLoggedIn",
            "setUserId"
        ]),

        async getAuthCodeUrl() {
            return await getRedirectUrl();
        },

        /**
         * Returns true if user is logged in, else false
         * @return {Boolean} logged in
         */
        isLoggedIn () {
            this.checkLoggedIn();
            return this.loggedIn;
        },

        /**
         * Logs out the user by removing all cookies and clearing the store
         * @param {Boolean} [reload = false] if true, the window will be reloaded after logout
         *
         * @return {void}
         */
        logoutButton (reload = false) {
            this.logout();
            this.moveTool();
        },


        async openLoginWindow () {
            if (!this.loggedIn) {
                const params = "width=500,height=500,status=no,location=no,menubar=no," +
                        `top=${window.screenY + (window.outerHeight - 500) / 2.5},` +
                        `left=${window.screenX + (window.outerWidth - 500) / 2}`,

                    loginPopup = window.open(await this.getAuthCodeUrl(), "login", params);

                this.timer = setInterval(() => {
                    if (this.isLoggedIn()) {
                        loginPopup.close();
                        clearInterval(this.timer);
                        this.moveTool();
                    }
                }, 100);
            }
        },
    }
};
