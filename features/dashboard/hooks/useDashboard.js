
import {computed, ref, nextTick} from "vue";

import {useStore} from "vuex";
import isMobile from "../../../../../../src/shared/js/utils/isMobile";
import * as constants from "../../../store/contantsDataNarrator";
import {dataNarratorModes, ToolwindowModes} from "../../../store/contantsDataNarrator";

/**
 *
 */
export function useDataNarrator () {

    const isOpen = ref(true),
        stories = ref([]),

        setIsOpen = () => {
            isOpen.value = !isOpen.value;
            this.moveTool();
        },

        store = useStore(),

        setToolWindowMode = () => store.commit("Modules/DataNarrator/setToolwindowMode"),

        disableMainMenu = () => {
            const mainMenu = document.querySelector("#mp-menu-mainMenu"),
                mainMenuToggleButton = document.querySelector("#mainMenu-toggle-button");

            mainMenu.style.cssText = "display: none !important;";
            mainMenuToggleButton.style.cssText = "opacity: 0 !important;pointer-events: none;";
        },

        disableSecondaryMenu = () => {
            const secondaryMenu = document.querySelector("#mp-menu-secondaryMenu"),
                secondaryMenuToggleButton = document.querySelector("#secondaryMenu-toggle-button");

            secondaryMenu.style.cssText = "display: none !important;";
            secondaryMenuToggleButton.style.cssText = "opacity: 0 !important;pointer-events: none;";
        },

        disableFooter = () => {
            const footer = document.querySelector("#module-portal-footer");

            footer.style.cssText = "display: none !important;";
        },

        getAllStories = () => {},

        moveTool = async ()=> {
            const toolWindows = document.querySelectorAll("#datanarrator-root .toolwindow-container .toolwindow");

            for (const toolWindow of toolWindows) {
                await nextTick();

                if (isMobile()) {
                    toolWindow.style.top = `${window.innerHeight - toolWindow.offsetHeight - constants.dataNarratorToolSettings.bottomOffset}px`;
                    setToolWindowMode(ToolwindowModes.MOBILE);
                }
                else {
                    toolWindow.style.top = "0px";

                    if (this.mode === dataNarratorModes.DASHBOARD) {
                        setToolWindowMode(ToolwindowModes.DASHBOARD);
                    }
                    else {
                        setToolWindowMode(ToolwindowModes.DESKTOP);
                    }
                }
            }
        };

    return {
        mode: computed(() => store.state.Modules.DataNarrator.mode),
        toolwindowMode: computed(() => store.state.Modules.DataNarrator.toolwindowMode),
        storyListMode: computed(() => store.state.Modules.DataNarrator.storyListMode),
        toolWindowPadding: computed(() => store.state.Modules.DataNarrator.toolWindowPadding),
        isOpen,
        stories,

        moveTool,
        setIsOpen,
        disableFooter,
        disableMainMenu,
        disableSecondaryMenu,
        getAllStories
    };
}
