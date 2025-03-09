import {useStore} from "vuex";
import isMobile from "../../../../../../../src/shared/js/utils/isMobile";

export const useToolWindow = () => {

    const store = useStore();
    const setToolWindowMode = () => store.commit("Modules/DataNarrator/setToolwindowMode");
    const isToolMobile = isMobile();

    return {
        setToolWindowMode,
        isMobile: isToolMobile
    };
};
