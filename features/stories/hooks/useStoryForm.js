import {useStore} from "vuex";
import {computed, customRef} from "vue";
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
    const updateStory = async () => {
        // TODO: create valid story object and send to backend using service (or just move service method here?)
        const storyState = store.state.Modules.DataNarrator.EditStoryForm;

        const story = {
            title: storyState.storyTitle,
            description: storyState.storyDescription,
        }

        if (isValidStory(story)){
            await fetch(`${backendUrl}/stories/${storyState.selectedStoryId}`, {
                method: "PUT",
                body: JSON.stringify({
                    ...story
                })
            });
        }
    }
    const createDraftStory = async () => {
        console.log("Creating draft story 2");
        const response = await fetch(`${backendUrl}/stories/draft`, {
            method: "POST"
        });
        if (response.ok) {
            console.log("Creating draft story 3 success");
            const storyId = await response.json();
            console.log("Creating draft story 4", storyId);
            store.commit('Modules/DataNarrator/EditStoryForm/setSelectedStoryId', storyId)
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
    const storyId = computed(() => store.state.Modules.DataNarrator.EditStoryForm.selectedStoryId)

    const fetchStory = async () => {
        if (storyId) {
            console.log(storyId, storyId.value);
            const response = await fetch(`${backendUrl}/stories/${storyId.value}`);
            if (response.ok) {
                const storyData = await response.json();
                const newStory = {
                    title: storyData.title,
                    description: storyData.description
                }
                store.commit('Modules/DataNarrator/EditStoryForm/setStoryData', newStory);
            }
        }
    }

    return {
        title,
        description,
        storyId,
        createStory,
        updateStory,
        createDraftStory,
        fetchStory
    }
}
