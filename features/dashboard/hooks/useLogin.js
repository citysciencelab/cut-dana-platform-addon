import {ref} from "vue";

export function useLogin () {

    const loggedIn = ref(false);

    function openLoginWindow () {
        loggedIn.value = true;
    }

    return {
        loggedIn,
        openLoginWindow
    }
}
