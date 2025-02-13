import {createVuetify} from "vuetify";
import "vuetify/dist/vuetify.min.css";
import * as components from "vuetify/lib/components";
import * as labsComponents from "vuetify/lib/labs";
import * as directives from "vuetify/lib/directives";
import {aliases, mdi} from "vuetify/lib/iconsets/mdi-svg";
import "@mdi/font/css/materialdesignicons.css";

const vuetify = createVuetify({
    components,
    labsComponents,
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
        defaultSet: "mdiSvg",
        aliases,
        sets: {
            mdiSvg: mdi
        }
    }
});

export default vuetify;
