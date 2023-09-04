import GenericTool from "../../../../src/modules/tools/indexTools";
import composeModules from "../../../../src/app-store/utils/composeModules";
import actions from "./actionsDataNarrator";
import getters from "./gettersDataNarrator";
import mutations from "./mutationsDataNarrator";
import state from "./stateDataNarrator";

export default composeModules([
    GenericTool,
    {
        namespaced: true, // mandatory
        state,
        actions,
        mutations,
        getters
    }
]);
