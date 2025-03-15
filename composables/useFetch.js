import {ref, toValue, watchEffect} from "vue";


export const useFetch = (url, options) => {
    const data = ref(null);
    const error = ref(null);
    const loading = ref(false);

    const fetchData = () => {
        // reset state before fetching.
        data.value = null
        error.value = null
        loading.value = true

        fetch(toValue(url), options)
            .then((res) => res.json())
            .then((json) => (data.value = json))
            .catch((err) => (error.value = err))
            .finally(() => (loading.value = false));
    }

    watchEffect(() => {
        fetchData();
    })

    return { data, error, loading };
}
