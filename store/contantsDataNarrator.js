const dataNarratorModes = {
    DASHBOARD: "dashboard",
    CREATE_STORY: "create-story",
    CREATE_CHAPTER: "create-chapter",
    CREATE_STEP: "create-step",
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

const backendUrl = "http://localhost:8000";

export {
    dataNarratorModes,
    dataNarratorToolSettings,
    ToolwindowModes,
    backendUrl,
}
