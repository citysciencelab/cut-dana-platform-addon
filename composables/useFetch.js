import {ref, toValue, watch, watchEffect} from "vue";


export const useFetch = (url, options) => {
    const data = ref(null);
    const error = ref(null);
    const loading = ref(false);
    const previousUrl = ref(null);

    const fetchData = (newUrl) => {
        // Skip refetch if the URL value is the same
        if (newUrl === previousUrl.value) return;

        // Store the new URL value
        previousUrl.value = newUrl;

        // reset state before fetching.
        data.value = null;
        error.value = null;
        loading.value = true;

        fetch(newUrl, options)
            .then((res) => res.json())
            .then((json) => (data.value = json))
            .catch((err) => (error.value = err))
            .finally(() => (loading.value = false));
    }

    watch(() => toValue(url), (newUrl) => {
        fetchData(newUrl);
    }, { immediate: true });

    return { data, error, loading };
}
