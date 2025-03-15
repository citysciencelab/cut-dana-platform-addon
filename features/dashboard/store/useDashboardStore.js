import {defineStore} from "pinia";
import {ref, watch} from "vue";


export const useDashboardStore = defineStore("dashboard", () => {
    const mode = ref("all");
    const open = ref(true);

    // Watch for changes to the mode ref and log them
    watch(mode, (newValue, oldValue) => {
        console.log(`Dashboard mode changed from ${oldValue} to ${newValue}`);
    });

    return {
        mode,
        open,
    };
});
