import {useStore} from "vuex";
import {computed, customRef} from "vue";


export function useStoryForm () {
    const store = useStore();

    const title = customRef((track, trigger) => {
        return {
            get() {
                track()
                return store.state.Modules.DataNarrator.EditStoryForm.storyTitle
            },
            set(newValue) {
                store.commit('Modules/DataNarrator/EditStoryForm/setStoryTitle', newValue)
                trigger()
            }
        }
    })
    const description = customRef((track, trigger) => {
        return {
            get() {
                track()
                return store.state.Modules.DataNarrator.EditStoryForm.storyDescription
            },
            set(newValue) {
                store.commit('Modules/DataNarrator/EditStoryForm/setStoryDescription', newValue)
                trigger()
            }
        }
    })

    return {
        title,
        description
    }
}
