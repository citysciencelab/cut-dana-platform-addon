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
    emptyStoryConf = {
        storyInterval: 0,
        titleImage: "",
        chapters: [],
        steps: []
    },
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
    emptyStoryConf,
    htmlEditorToolbar,
    dataNarratorRoles
};
