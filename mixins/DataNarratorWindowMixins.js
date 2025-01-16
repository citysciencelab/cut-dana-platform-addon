import {nextTick} from "vue";
import * as constants from "../store/contantsDataNarrator";
import isMobile from "../../../src/shared/js/utils/isMobile";

export default {
    mixins: [],
    data () {
        return {
            isMobile: false,
            checkMobileInterval: null,
            checkMobileTimeout: 200,
            isPreviousMobile: false,

            footerHeight: 0
        };
    },
    mounted () {
        this.checkMobileInterval = setInterval(() => this.updateIsMobile(), this.checkMobileTimeout);
    },
    beforeDestroy() {
        clearInterval(this.checkMobileInterval);
    },
    methods: {
        updateIsMobile () {
          this.isMobile = isMobile();
        },

        disableMainMenu () {
            const mainMenu = document.querySelector('#mp-menu-mainMenu');
            const mainMenuToggleButton = document.querySelector('#mainMenu-toggle-button');

            mainMenu.style.cssText = 'display: none !important;';
            mainMenuToggleButton.style.cssText = 'opacity: 0 !important;pointer-events: none;';
        },

        disableSecondaryMenu () {
            const secondaryMenu = document.querySelector('#mp-menu-secondaryMenu');
            const secondaryMenuToggleButton = document.querySelector('#secondaryMenu-toggle-button');

            secondaryMenu.style.cssText = 'display: none !important;';
            secondaryMenuToggleButton.style.cssText = 'opacity: 0 !important;pointer-events: none;';
        },

        disableFooter () {
            const footer = document.querySelector('#module-portal-footer');

            footer.style.cssText = 'display: none !important;';
        },

        async moveTool () {
            const toolWindow = document.querySelectorAll("#datanarrator-root .toolwindow-container .toolwindow")[0];

            await nextTick();
            if (this.isMobile) {
                toolWindow.style.top = `${window.innerHeight - toolWindow.offsetHeight - constants.dataNarratorToolSettings.bottomOffset - constants.dataNarratorToolSettings.toolWindowPadding}px`;
            } else {
                toolWindow.style.top = `0px`;
            }
        }
    },
    computed: {

    },
    watch: {
        isMobile () {
            if (this.isMobile !== this.isPreviousMobile) {
                this.isPreviousMobile = this.isMobile;
                this.moveTool();
            }
        }
    }
};
