import {computed, nextTick} from "vue";
import * as constants from "../store/contantsDataNarrator";
import {dataNarratorModes, ToolwindowModes} from "../store/contantsDataNarrator";
import {useToolWindow} from "../features/shared/Toolwindow/hooks/useToolWindow";
import {useStore} from "vuex";


export const useDataNarrator = () => {
    const {setToolWindowMode, isMobile} = useToolWindow();

    const store = useStore();

    const disableMainMenu = () => {
        const mainMenu = document.querySelector("#mp-menu-mainMenu"),
            mainMenuToggleButton = document.querySelector("#mainMenu-toggle-button");

        mainMenu.style.cssText = "display: none !important;";
        mainMenuToggleButton.style.cssText = "opacity: 0 !important;pointer-events: none;";
    };

    const disableSecondaryMenu = () => {
        const secondaryMenu = document.querySelector("#mp-menu-secondaryMenu"),
            secondaryMenuToggleButton = document.querySelector("#secondaryMenu-toggle-button");

        secondaryMenu.style.cssText = "display: none !important;";
        secondaryMenuToggleButton.style.cssText = "opacity: 0 !important;pointer-events: none;";
    };

    const disableFooter = () => {
        const footer = document.querySelector("#module-portal-footer");

        footer.style.cssText = "display: none !important;";
    }

    const moveTool = async ()=> {
        const toolWindows = document.querySelectorAll("#datanarrator-root .toolwindow-container .toolwindow");

        for (const toolWindow of toolWindows) {
            await nextTick();

            if (isMobile) {
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

    const gotoPage = (mode) => {
        store.commit("Modules/DataNarrator/setMode", mode);
        moveTool();
    }

    const openLayerEditor = () => {
        gotoPage(dataNarratorModes.CREATE_STORY);
    }

    return {
        mode: computed(() => store.state.Modules.DataNarrator.mode),
        toolwindowMode: computed(() => store.state.Modules.DataNarrator.toolwindowMode),
        toolWindowPadding: computed(() => store.state.Modules.DataNarrator.toolWindowPadding),

        disableMainMenu,
        disableSecondaryMenu,
        disableFooter,
        moveTool,
        gotoPage,
        openLayerEditor
    }
}
