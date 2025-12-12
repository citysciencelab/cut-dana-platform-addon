import { generateSimpleGetters } from '../../../../src/shared/js/utils/generators';

import commuterDataNarrator from './stateDataNarrator';

const getters = {
    ...generateSimpleGetters(commuterDataNarrator)
};

export default getters;
