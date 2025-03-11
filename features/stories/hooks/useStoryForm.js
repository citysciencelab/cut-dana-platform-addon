import {useStore} from "vuex";
import {computed} from "vue";


export function useStoryForm () {
    const store = useStore();
    const title = computed({
        get () {
            store.state.Modules.DataNarrator.EditStoryForm.storyTitle
        },
        set (value) {
            store.commit("Modules/DataNarrator/EditStoryForm/setStoryTitle", value);
        }
    });
    const description = computed({
        get () {
            store.state.Modules.DataNarrator.EditStoryForm.storyDescription
        },
        set (value) {
            store.commit("Modules/DataNarrator/EditStoryForm/setStoryDescription", value);
        }
    });

    return {
        title,
        description
    }
}
