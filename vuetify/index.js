import Vue from "vue";
import Vuetify from "vuetify";
import "vuetify/dist/vuetify.min.css";
import { HomeIcon } from "@heroicons/vue/outline"

Vue.use(Vuetify);

const opts = {
    icons: {
        iconfont: "md",
        values: {
            home: {
                component: HomeIcon,
            }
        }
    },
    theme: {
        themes: {
            light: {
                primary: "#66afe9"
            }
        }
    }
};

export default new Vuetify(opts);
