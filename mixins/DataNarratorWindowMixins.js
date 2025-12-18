import { nextTick } from 'vue';

import { mapGetters, mapMutations } from 'vuex';

import isMobile from '../../../../src/shared/js/utils/isMobile';
import * as constants from '../store/contantsDataNarrator';
import { dataNarratorModes, ToolwindowModes } from '../store/contantsDataNarrator';


import getters from '../store/gettersDataNarrator';
import mutations from '../store/mutationsDataNarrator';

export default {
  mixins: [],
  data () {
    return {
      isMobile: false,
      checkMobileInterval: null,
      checkMobileTimeout: 200,
      isPreviousMobile: false,

      isOpen: true,

      footerHeight: 0
    };
  },

  mounted() {
    this.checkMobileInterval = setInterval(() => this.updateIsMobile(), this.checkMobileTimeout);
  },
  beforeDestroy() {
    clearInterval(this.checkMobileInterval);
  },

  methods: {
    ...mapMutations('Modules/DataNarrator', [ 'setToolwindowMode' ]),

    setToolIsOpen () {
      this.isOpen = !this.isOpen;
      this.moveTool();
    },

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
      const toolWindows = document.querySelectorAll('#datanarrator-root .toolwindow-container .toolwindow');

      for (const toolWindow of toolWindows) {
        await nextTick();

        if (isMobile()) {
          toolWindow.style.top = `${window.innerHeight - toolWindow.offsetHeight - constants.dataNarratorToolSettings.bottomOffset}px`;
          this.setToolwindowMode(ToolwindowModes.MOBILE);
        } else {
          toolWindow.style.top = '0px';

          if (this.mode === dataNarratorModes.DASHBOARD) {
            this.setToolwindowMode(ToolwindowModes.DASHBOARD);
          } else {
            this.setToolwindowMode(ToolwindowModes.DESKTOP);
          }
        }
      }
    }
  },
  computed: {
    ...mapGetters('Modules/DataNarrator', Object.keys(getters))
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
