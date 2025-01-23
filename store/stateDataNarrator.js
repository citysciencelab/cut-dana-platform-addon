import {dataNarratorModes, ToolwindowModes} from "./contantsDataNarrator";

const state = {
    description: "additional:modules.DataNarrator.description",
    active: false,
    id: "DataNarrator",
    name: "additional:modules.DataNarrator.title",
    icon: "bi-book",
    renderToWindow: true,
    resizableWindow: true,
    isVisibleInMenu: true,
    deactivateGFI: true,
    metaVerPath: "",
    blacklistedDistricts: [],
    serviceURL: "",
    listChunk: 5,
    setMarkerOnClickInList: true,
    onstart: {
        captionsChecked: true,
        numbersChecked: true,
        beamsChecked: true,
        animationChecked: false,
        direction: "out"
    },
    mode: dataNarratorModes.DASHBOARD,
    toolwindowMode: ToolwindowModes.DASHBOARD,
    isLoginOpen: true,
};

export default state;
