import threeDManagerState from "./state/threeDManagerState";
/**
 * User type definition
 * @typedef {object} DataNarratorState
 * @property {string} id the ID of the story telling tool
 * @property {Object} currentStory current story
 * @property {String} currentStoryId current story id
 * @property {Number} currentChapterId current chapter id
 * @property {Number} currentStepId current step id
 * @property {Object} htmlContentsImages the HTML content images used for story creation
 * @property {boolean} active if true, the story telling tool will be rendered
 * @property {string} name displayed as title (config-param)
 * @property {string} glyphicon icon next to title (config-param)
 * @property {boolean} renderToWindow if true, tool is rendered in a window, else in sidebar (config-param)
 * @property {boolean} resizableWindow if true, window is resizable (config-param)
 * @property {boolean} isVisibleInMenu if true, tool is selectable in menu (config-param)
 * @property {boolean} deactivateGFI flag if tool should deactivate gfi (config-param)
 * @property {Number} initialWidth Size of the sidebar when opening.
 * @property {Number} initialWidthMobile Mobile size of the sidebar when opening.
 * @property {object} config for story to display.
*/
const state = {
    id: "dataNarrator",
    currentStory: null,
    currentStoryId: null,
    htmlContentsImages: {},
    autoplay: false,
    ...threeDManagerState,

    // defaults for config.json parameters
    active: false,
    keepOpen: true,
    name: "Story Telling Tool",
    glyphicon: "glyphicon-book",
    renderToWindow: true,
    resizableWindow: true,
    isVisibleInMenu: true,
    deactivateGFI: false,
    initialWidth: 500,
    initialWidthMobile: 300,
    storyInterval: null,
    userRole: null,
    mode: null,
    backendConfig: {
        url: null,
        user: null,
        password: null
    }
};

export default state;
