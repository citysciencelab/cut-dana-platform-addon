<script>
import {mapGetters} from "vuex";

import CreateStoryButton from "./Tools/CreateStoryButton.vue";
import LanguageSwitchButton from "./Tools/LanguageSwitchButton.vue";
import ListButton from "./Tools/ListButton.vue";
import LoginButton from "./Tools/LoginButton.vue";

export default {
    name: "DashboardHeader",
    components: {
        LanguageSwitchButton,
        LoginButton,
        CreateStoryButton,
        ListButton
    },
    props: {
        myMode: {
            type: Boolean,
            default: false
        },
        storyListMode: {
            type: String,
            default: "all"
        }
    },
    computed: {
        ...mapGetters(["mobile"])
    },
    methods: {
        availableStoryListModes () {
            const modes = ["all", "featured", "popular"];

            if (this.myMode) {
                modes.push("my");
            }
            return modes;
        }
    }
};
</script>

<template>
    <span>
        <v-row class="login-row">
            <v-col class="d-flex justify-end align-center">
                <LoginButton />
                <LanguageSwitchButton />
            </v-col>
        </v-row>

        <v-row
            class="with-fancy-background"
            :style="`background-image: url(${require(mobile ? '../../img/header_small.png' : '../../img/header.png')})`"
        >

            <v-col
                lg="1"
                md="1"
                sm="2"
                cols="2"
                class="d-flex align-start justify-center"
            >
                <img
                    src="../../img/logo.png"
                    alt="logo"
                    class="header-logo"
                >
            </v-col>
            <v-col
                lg="4"
                md="5"
                sm="9"
                cols="9"
                class="justify-start align-start"
            >
                <h1 class="header-h1">Data Stories</h1>
                <h4 class="header-h4">Ein Tool zum Sichtbarmachen.</h4>
                <p>Ein Data Story Tool, das die Geo-Daten von Hamburg integriert. Mithilfe dieser Software
                    können Nutzer geografische Informationen nutzen, um anschauliche und informative Erzählungen
                    über Hamburg zu gestalten, sei es zu Themen wie städtischer Entwicklung, Umwelttrends oder
                    kultureller Vielfalt.</p>
            </v-col>

            <v-col
                cols="12"
                class="d-flex justify-center align-end"
            >
                <CreateStoryButton v-on="$listeners" />
            </v-col>
        </v-row>

        <v-row class="list-buttons">
            <v-col class="d-flex justify-center align-center">
                <ListButton
                    v-for="mode in availableStoryListModes()"
                    :key="mode"
                    :mode="mode"
                    :active="storyListMode === mode"
                    v-on="$listeners"
                />
            </v-col>
        </v-row>
    </span>
</template>


<style lang="scss" scoped>
.login-row {
    margin-top: -1rem !important;
}


.with-fancy-background {
    background-position: right top;
    min-height: 220px;

    @media (min-width: 768px){
      background-position: right top;
      min-height: 332px;
    }
}

.list-buttons {
    margin-top: 0.5rem !important;
}

.header-h1 {
    font-size: 2.5rem;
    font-weight: 700;
    text-transform: uppercase;
    color:black;
    margin-top: 0.25rem;
}

.header-h4 {
  margin-bottom: 1rem;
}

</style>
