import {ref, toValue, watch} from "vue";


export const useFetch = (url, options) => {
    const data = ref(null);
    const error = ref(null);
    const loading = ref(false);

    // Use watch instead of watchEffect for more control
    watch(() => toValue(url), (newUrl) => {
        // reset state before fetching
        data.value = null;
        error.value = null;
        loading.value = true;

        fetch(newUrl, options)
            .then((res) => res.json())
            .then((json) => (data.value = json))
            .catch((err) => (error.value = err))
            .finally(() => (loading.value = false));
    }, { immediate: true }); // Ensure it runs immediately on mount

    return { data, error, loading };
}
