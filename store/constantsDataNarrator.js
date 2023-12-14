import * as threeDManagerConstants from "./constants/threeDManagerConstants";

const storyTellingModes = {
        CREATE: "create",
        PLAY: "play",
        DASHBOARD: "dashboard"
    },
    dataNarratorRoles = {
        ADMIN: "admin",
        EDITOR: "editor",
        VIEWER: "viewer"
    },
    storyTellingModeIcons = {
        [storyTellingModes.CREATE]: "add",
        [storyTellingModes.PLAY]: "play_arrow",
        [storyTellingModes.DASHBOARD]: "dashboard"
    },
    storyCreationViews = {
        STORY_CREATION: "story",
        STEP_CREATION: "step",
        PREVIEW: "preview",
        THREE_D: "3d",
        ENTITY_EDITOR: "entityEditor"
    },
    emptyStory = {
        storyInterval: 0,
        displayType: "classic",
        chapters: [],
        steps: [],
        threeDFilesId: "",
        threeDFiles: []
    },
    emptyStep = {
        stepNumber: null,
        stepWidth: 0,
        visible: true,
        associatedChapter: null,
        title: "",
        html: "",
        htmlFile: null,
        centerCoordinate: null,
        zoomLevel: null,
        layers: [],
        interactionAddons: [],
        is3D: false,
        navigation3D: {
            cameraPosition: [
                null,
                null,
                null
            ],
            heading: null,
            pitch: null
        },
        selectedModelIds: []
    },
    stepPalette = [
        {main: "#413FAB", secondary: "#A3C4FF"},
        {main: "#893D05", secondary: "#FEE397"},
        {main: "#236051", secondary: "#72CD86"},
        {main: "#584560", secondary: "#C2A7CD"}
    ],
    htmlEditorToolbar = [
        [{header: [false, 1, 2, 3, 4, 5, 6]}],
        ["bold", "italic", "underline", "strike"],
        [
            {align: ""},
            {align: "center"},
            {align: "right"},
            {align: "justify"}
        ],
        [{list: "ordered"}, {list: "bullet"}],
        ["blockquote", "code-block"],
        [{color: []}, {background: []}],
        ["link", "image"],
        ["clean"]
    ];

export {
    threeDManagerConstants,
    dataNarratorRoles,
    emptyStep, emptyStory,
    htmlEditorToolbar, stepPalette, storyCreationViews, storyTellingModeIcons, storyTellingModes
};

