// this hook is meant for all the map movements

import {computed, customRef} from "vue";
import {useStore} from "vuex";

export function useNavigation () {
    const store = useStore();

    const zoom = computed(() => store.state.Maps.zoom);
    const center = computed(() => store.state.Maps.center);

    return {
        zoom,
        center
    }
}
