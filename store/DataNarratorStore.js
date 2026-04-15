import DashboardStore from '../features/dashboard/store/DashboardStore';
import EditStoryForm from '../features/stories/store/EditStoryForm';
import LayersStore from '../features/stories/store/LayersStore';
import StoryStore from '../features/stories/store/StoryStore';

import EditStepForm from './EditStepForm';

import getters from './gettersDataNarrator';
import mutations from './mutationsDataNarrator';
import state from './stateDataNarrator';

export default {
  namespaced: true,
  state,
  mutations,
  getters,
  modules: {
    EditStoryForm,
    EditStepForm,
    DashboardStore,
    StoryStore,
    LayersStore
  }
};
