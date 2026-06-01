import { computed, nextTick } from 'vue';

import { useStore } from 'vuex';

import { useToolWindow } from '../features/shared/Toolwindow/hooks/useToolWindow';
import * as constants from '../store/contantsDataNarrator';
import { dataNarratorModes, ToolwindowModes } from '../store/contantsDataNarrator';


export const useDataNarrator = () => {
  const { setToolWindowMode, isMobile } = useToolWindow();
  const store = useStore();

  const mode = computed(() => store.state.Modules.DataNarrator.mode);

  const disableMainMenu = () => {
    const mainMenu = document.querySelector('#mp-menu-mainMenu'),
      mainMenuToggleButton = document.querySelector('#mainMenu-toggle-button');

    if (mainMenu) {
      mainMenu.style.cssText = 'display: none !important;';
    }
    if (mainMenuToggleButton) {
      mainMenuToggleButton.style.cssText = 'opacity: 0 !important;pointer-events: none;';
    }
  };

  const disableSecondaryMenu = () => {
    const secondaryMenu = document.querySelector('#mp-menu-secondaryMenu'),
      secondaryMenuToggleButton = document.querySelector('#secondaryMenu-toggle-button');

    if (secondaryMenu) {
      secondaryMenu.style.cssText = 'display: none !important;';
    }
    if (secondaryMenuToggleButton) {
      secondaryMenuToggleButton.style.cssText = 'opacity: 0 !important;pointer-events: none;';
    }
  };

  const disableFooter = () => {
    const footer = document.querySelector('#module-portal-footer');

    if (footer) {
      footer.style.cssText = 'display: none !important;';
    }
  };

  const moveTool = async () => {
    const toolWindows = document.querySelectorAll('#datanarrator-root .toolwindow-container .toolwindow');

    for (const toolWindow of toolWindows) {
      await nextTick();

      if (isMobile.value) {
        toolWindow.style.top = `${window.innerHeight - toolWindow.offsetHeight - constants.dataNarratorToolSettings.bottomOffset}px`;
        setToolWindowMode(ToolwindowModes.MOBILE);
      } else {
        toolWindow.style.top = '0px';

        if (mode.value === dataNarratorModes.DASHBOARD) {
          setToolWindowMode(ToolwindowModes.DASHBOARD);
        } else {
          setToolWindowMode(ToolwindowModes.DESKTOP);
        }
      }
    }
  };

  const gotoPage = (newMode) => {
    store.commit('Modules/DataNarrator/setMode', newMode);
    moveTool();
  };

  return {
    mode,
    toolwindowMode: computed(() => store.state.Modules.DataNarrator.toolwindowMode),

    disableMainMenu,
    disableSecondaryMenu,
    disableFooter,
    moveTool,
    gotoPage
  };
};
