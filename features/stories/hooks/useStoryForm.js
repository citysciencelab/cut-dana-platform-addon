import {useStore} from "vuex";
import {customRef} from "vue";
import {backendUrl} from "../../../store/contantsDataNarrator";
import {isNullOrWhitespace} from "../../../utils/stringUtils";
import {useLogin} from "../../dashboard/hooks/useLogin";


export function useStoryForm () {
    const store = useStore();
    const {accessToken} = useLogin();

    const createStory = async () => {
        // TODO: create valid story object and send to backend using service (or just move service method here?)
        const storyState = store.state.Modules.DataNarrator.EditStoryForm;

        const story = {
            title: storyState.storyTitle,
            description: storyState.storyDescription,
        }

        console.log(story);

        if (isValidStory(story)){
            await fetch(`${backendUrl}/stories`, {
                method: "POST",
                body: JSON.stringify({
                    ...story
                })
            });
        }
    }

    const isValidStory = (story) => {
        return !isNullOrWhitespace(story.title) && !isNullOrWhitespace(story.description)
    }

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
        description,
        createStory
    }
}
