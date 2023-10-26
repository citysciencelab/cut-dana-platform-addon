import axios from "axios";
import {generateSimpleGetters} from "../../../../src/app-store/utils/generators";
import dataNarratorState from "./stateDataNarrator";

const getters = {
    ...generateSimpleGetters(dataNarratorState),
    /**
         * get own datasources
         * @param {Object} context actions context object.
         * @returns {void}
         */
    ownDatasources ({state}, {hash}) {
        return axios.get(state.backendConfig.url + "/datasources/" + state.currentStoryId + "/" + hash).then((response) => {
            return response.data;
        });
    }
};

export default getters;
