import {computed, ref} from "vue";
import {useStore} from "vuex";
import {getStories} from "../services/getStories";

/**
 *
 */
export function useDashboard () {


    const isOpen = ref(true),
        stories = ref([]),

        store = useStore(),

        setIsOpen = () => {
            isOpen.value = !isOpen.value;
            this.moveTool();
        },

        getAllStories = async () => {
            const response = await getStories();
            const data = await response.json();
            
            stories.value = data;
        };

    return {

        storyListMode: computed(() => store.state.Modules.DataNarrator.storyListMode),
        isOpen,
        stories,

        setIsOpen,
        getAllStories
    };
}
