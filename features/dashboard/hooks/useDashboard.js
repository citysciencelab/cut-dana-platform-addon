import {customRef, ref} from "vue";
import {useStore} from "vuex";
import {availableStoryListModes} from "../../../store/contantsDataNarrator";
import {useGetStories} from "../../../composables/services/stories/useGetStories";

/**
 *
 */
export function useDashboard () {
    const store = useStore()


    const storiesDisplayMode = customRef((track, trigger) => {
        return {
            get() {
                track()
                return store.state.Modules.DataNarrator.DashboardStore.mode
            },
            set(newValue) {
                store.commit('Modules/DataNarrator/DashboardStore/setMode', newValue)
                trigger()
            }
        }
    })

    const isOpen = ref(true);


    const {stories, error, loading} = useGetStories(storiesDisplayMode);

    return {
        isOpen,
        stories,
        error,
        loading,
        storiesDisplayMode,
        availableStoryListModes,
    };
}
