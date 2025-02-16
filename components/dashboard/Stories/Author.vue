<script>
import {mdiAccountOutline} from "@mdi/js";
import {backendUrl} from "../../../store/contantsDataNarrator";
import LoginMixin from "../../../mixins/LoginMixin";

export default {
    name: "AuthorDisplay",
    mixins: [LoginMixin],
    props: {
        authorId: {
            type: String,
            default: null
        }
    },
    data () {
        return {
            icons: {
                mdiAccountOutline
            },
            isLoading: true,
            author: null
        };
    },

    created() {
        this.fetchAuthor();
    },

    methods: {
        async fetchAuthor() {
            const userData = await fetch(`${backendUrl}/users/${this.authorId}`);
            this.author = await userData.json();
            this.isLoading = false;
        }
    },
};
</script>

<template>
    <div v-if="isLoading">
        Loading...
    </div>
    <div v-else>
        <v-tooltip top>
            <template>
                <v-card-subtitle class="card-subtitle">
                    <v-icon small>
                        {{ icons.mdiAccountOutline }}
                    </v-icon>
                    {{ author.username }}
                </v-card-subtitle>
            </template>
            <span>
                {{
                    author.email
                }}
            </span>
        </v-tooltip>
    </div>
</template>
