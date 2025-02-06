import {createVuetify} from "vuetify";
import "vuetify/dist/vuetify.min.css";
import * as components from "vuetify/lib/components/index.mjs";
import * as directives from "vuetify/lib/directives/index.mjs";

const vuetify = createVuetify({
    components,
    directives,
    theme: {
        defaultTheme: "light",
        themes: {
            light: {
                colors: {
                    primary: "#66afe9"
                }
            }
        }
    },
    icons: {
        iconfont: "mdiSvg"
    }
});

export default vuetify;
