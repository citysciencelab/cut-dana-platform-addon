export default {
    data () {
        return {

        };
    },
    methods: {
        disableMainMenu () {
            const mainMenu = document.querySelector('#mp-menu-mainMenu');
            const mainMenuToggleButton = document.querySelector('#mainMenu-toggle-button');

            mainMenu.style.cssText = 'display: none !important;';
            mainMenuToggleButton.style.cssText = 'display: none !important;';
        },

        disableSecondaryMenu () {
            const secondaryMenu = document.querySelector('#mp-menu-secondaryMenu');
            const secondaryMenuToggleButton = document.querySelector('#secondaryMenu-toggle-button');

            secondaryMenu.style.cssText = 'display: none !important;';
            secondaryMenuToggleButton.style.cssText = 'display: none !important;';
        }
    }
};
