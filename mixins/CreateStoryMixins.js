import * as dataNarratorConstants from "../store/contantsDataNarrator";
import LoginMixin from "./LoginMixin";
import {mapGetters, mapMutations,} from "vuex";
import {mutations as editStoryMutations, state as editStoryState} from "../store/FormStores/EditStoryForm";

export default {
    mixins: [LoginMixin],

    computed: {
        ...mapGetters("Modules/DataNarrator/EditFormStore", Object.keys(editStoryState)),
    },

    methods: {
        ...mapMutations("Modules/DataNarrator/EditFormStore", Object.keys(editStoryMutations)),

        async updateStory() {
            const token = this.accessToken;
            const response = await fetch(`http://localhost:8000/stories/${this.selectedStoryId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: this.storyTitle,
                    description: this.storyDescription
                })
            })
        },

        async createStory() {
            const token = this.accessToken;
            const response = await fetch("http://localhost:8000/stories", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: this.storyTitle,
                    description: this.storyDescription
                })
            })
            let data = null;
            try {
                data = await response.json();
            } catch (e) {
                console.error(e);
            }
        },

        async saveStory() {
            if (this.selectedStoryId) {
                return await this.updateStory();
            }
            return await this.createStory();
        },

        async getStory(storyId) {
            const response = await fetch(`http://localhost:8000/stories/${storyId}`)

            return await response.json();
        }
    }
};
