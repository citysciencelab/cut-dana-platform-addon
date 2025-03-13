import {useFetch} from "../../useFetch";
import {backendUrl} from "../../../store/contantsDataNarrator";
import {computed, toValue} from "vue";

export const useGetStories = (mode) => {

    const url = computed(() => `${backendUrl}/stories/${toValue(mode)}`)
    const {data: stories, error, loading} = useFetch(url);

    return {stories, error, loading};
}
