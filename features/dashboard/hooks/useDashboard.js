import {customRef, ref} from "vue";
import {useStore} from "vuex";
import {getStories} from "../services/getStories";
import {availableStoryListModes} from "../../../store/contantsDataNarrator";

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

    const stories = customRef((track, trigger) => {
        return {
            get() {
                track()
                return store.state.Modules.DataNarrator.DashboardStore.stories
            },
            set(newValue) {
                store.commit('Modules/DataNarrator/DashboardStore/setStories', newValue)
                trigger()
            }
        }
    })

    const isOpen = ref(true);

    const setIsOpen = () => {
        isOpen.value = !isOpen.value;
        this.moveTool();
    };

    const getAllStories = async () => {
        console.elie("test");
        const response = await getStories(storiesDisplayMode.value);
        stories.value = await response.json();
    };

    const refetchStories = async (mode) => {
        storiesDisplayMode.value = mode;
        await getAllStories();
    }

    return {
        isOpen,
        stories,
        storiesDisplayMode,
        availableStoryListModes,

        setIsOpen,
        getAllStories,
        refetchStories
    };
}
