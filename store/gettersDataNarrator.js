import {generateSimpleGetters} from "../../../../src/app-store/utils/generators";
import dataNarratorState from "./stateDataNarrator";

const getters = {
    ...generateSimpleGetters(dataNarratorState)
};

export default getters;
