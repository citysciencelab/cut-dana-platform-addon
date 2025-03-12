import {useStore} from "vuex";
import {customRef} from "vue";

export function useChapterForm() {
    const store = useStore();

    const name = customRef((track, trigger) => {
        return {
            get() {
                track()
                return store.state.Modules.DataNarrator.EditChapterForm.chapterName
            },
            set(newValue) {
                store.commit('Modules/DataNarrator/EditChapterForm/setChapterName', newValue)
                trigger()
            }
        }
    })

    return {
        name
    }
}
