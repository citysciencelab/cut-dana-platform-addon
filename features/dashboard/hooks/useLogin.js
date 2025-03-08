import {ref} from "vue";
import {useStore} from "vuex";

export function useLogin () {

    const loggedIn = ref(false);
    const loginStore = useStore("Modules/Login");

    console.log("loginStore", loginStore);

    function openLoginWindow () {
        loggedIn.value = true;
    }

    return {
        loggedIn,
        openLoginWindow
    }
}
