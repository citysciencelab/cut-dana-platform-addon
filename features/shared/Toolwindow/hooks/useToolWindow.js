import {useStore} from "vuex";
import isMobile from "../../../../../../../src/shared/js/utils/isMobile";
import {dataNarratorModes, ToolwindowModes} from "../../../../store/contantsDataNarrator";
import {computed, onUnmounted, ref} from "vue";

export const useToolWindow = () => {

    const store = useStore();
    const setToolWindowMode = (mode) => store.commit("Modules/DataNarrator/setToolwindowMode", mode);
    const isToolMobile = ref(false);

    const keepWindowInCorrectMode = () => {
        const isMobileLocal = isMobile();

        isToolMobile.value = isMobileLocal;
        if (isMobileLocal) {
            setToolWindowMode(ToolwindowModes.MOBILE);
            return;
        }
        const currentMode = computed(() => store.state.Modules.DataNarrator.mode);

        if (currentMode.value === dataNarratorModes.DASHBOARD) {
            setToolWindowMode(ToolwindowModes.DASHBOARD);
        }
        else {
            setToolWindowMode(ToolwindowModes.DESKTOP);
        }
    }

    const windowChangeInterval = setInterval(keepWindowInCorrectMode, 100);

    onUnmounted(() => {
        clearInterval(windowChangeInterval);
    })

    return {
        setToolWindowMode,
        isMobile: isToolMobile
    };
};
