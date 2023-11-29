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
        PREVIEW: "preview"
    },
    emptyStory = {
        storyInterval: 0,
        displayType: "classic",
        chapters: [],
        steps: []
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
        }
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
    storyTellingModes,
    storyTellingModeIcons,
    storyCreationViews,
    emptyStory,
    htmlEditorToolbar,
    dataNarratorRoles,
    emptyStep,
    stepPalette
};
