import { ref, onMounted, onUnmounted } from 'vue';
import isMobile from "../../../../src/shared/js/utils/isMobile";

export const useIsMobile = () => {
    const isMobileRef = ref(isMobile());

    const updateIsMobile = () => {
        isMobileRef.value = isMobile();
    };

    onMounted(() => {
        window.addEventListener('resize', updateIsMobile);
    });

    onUnmounted(() => {
        window.removeEventListener('resize', updateIsMobile);
    });

    return {
        isMobile: isMobileRef
    };
};
