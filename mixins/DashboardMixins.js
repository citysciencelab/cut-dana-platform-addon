import {mapGetters, mapMutations} from "vuex";
import getters from "../store/gettersDataNarrator";
import DataNarratorWindowMixins from "./DataNarratorWindowMixins";
import LoginMixin from "./LoginMixin";

export default {

    data () {
        return {
            isLoading: false,

            stories: []
        };
    },

    computed: {
    },

    methods: {
        async getStories(succesCallback, errorCallback) {
            this.isLoading = true;
            const response = await fetch("http://localhost:8000/stories");
            if (response.ok) {
                this.isLoading = false;
                const data = await response.json();
                this.stories = data;
                succesCallback && succesCallback(data);
            } else {
                this.isLoading = false;
                errorCallback && errorCallback(response);
            }
        }
    }
};
