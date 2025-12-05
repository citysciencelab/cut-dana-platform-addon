const dataNarratorModes = {
    DASHBOARD: "dashboard",
    CREATE_STORY: "create-story",
    CREATE_STEP: "create-step",
    PLAY_STORY: "play-story",
    EDIT_STORY: "edit-story"
}

const dataNarratorToolSettings = {
    bottomOffset: 0,
    toolWindowPadding: 10
}

const ToolwindowModes = {
    MOBILE: "mobile", // mobile bottom view
    DASHBOARD: "dashboard", // sole purpose of showing the dashboard
    DESKTOP: "desktop" // for the desktop tool window on the left
}

const availableStoryListModes = {
    ALL: "all",
    FEATURED: "featured",
    POPULAR: "popular",
    MINE: "my",
};

const htmlEditorToolbar = [
    [{header: [false, 1, 2, 3, 4, 5, 6]}],
    ["bold", "italic", "underline", "strike"],
    [{color: []}, {background: []}],
    [
        {align: ""},
        {align: "center"},
        {align: "right"},
        {align: "justify"}
    ],
    [{list: "ordered"}, {list: "bullet"}],
    ["blockquote", "code-block"],
    ["link", "image"]
];

const backendUrl = Config.backendUrl || "https://staging-dana-backend.elie.de";

export {
    dataNarratorModes,
    dataNarratorToolSettings,
    ToolwindowModes,
    backendUrl,
    htmlEditorToolbar,
    availableStoryListModes
}
