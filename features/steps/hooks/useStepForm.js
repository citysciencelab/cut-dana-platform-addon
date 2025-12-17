import { customRef, ref } from 'vue';
import { useStore } from 'vuex';

export function useStepForm () {
  const store = useStore();

  const title = customRef((track, trigger) => {
    return {
      get() {
        track()
        return store.state.Modules.DataNarrator.EditStepForm.stepTitle;
      },
      set(newValue) {
        store.commit('Modules/DataNarrator/EditStepForm/setStepTitle', newValue)
        trigger()
      }
    }
  });
  const description = customRef((track, trigger) => {
    return {
      get() {
        track()
        return store.state.Modules.DataNarrator.EditStepForm.stepDescription;
      },
      set(newValue) {
        store.commit('Modules/DataNarrator/EditStepForm/setStepDescription', newValue)
        trigger()
      }
    }
  });
  const stepNumber = customRef((track, trigger) => {
    return {
      get() {
        track()
        return store.state.Modules.DataNarrator.EditStepForm.stepNumber;
      },
      set(newValue) {
        store.commit('Modules/DataNarrator/EditStepForm/setStepNumber', newValue)
        trigger()
      }
    }
  });
  const chapterId = customRef((track, trigger) => {
    return {
      get() {
        track()
        return store.state.Modules.DataNarrator.EditStepForm.stepChapterId;
      },
      set(newValue) {
        store.commit('Modules/DataNarrator/EditStepForm/setStepChapterId', newValue)
        trigger()
      }
    }
  });
  const width = customRef((track, trigger) => {
    return {
      get() {
        track()
        return store.state.Modules.DataNarrator.EditStepForm.stepWidth;
      },
      set(newValue) {
        store.commit('Modules/DataNarrator/EditStepForm/setStepWidth', newValue)
        trigger()
      }
    }
  });
  const visible = customRef((track, trigger) => {
    return {
      get() {
        track()
        return store.state.Modules.DataNarrator.EditStepForm.stepVisible;
      },
      set(newValue) {
        store.commit('Modules/DataNarrator/EditStepForm/setStepVisible', newValue)
        trigger()
      }
    }
  });
  const centerCoordinates = customRef((track, trigger) => {
    return {
      get() {
        track()
        return store.state.Modules.DataNarrator.EditStepForm.stepCenterCoordinates;
      },
      set(newValue) {
        store.commit('Modules/DataNarrator/EditStepForm/setStepCenterCoordinates', newValue)
        trigger()
      }
    }
  });
  const zoomLevel = customRef((track, trigger) => {
    return {
      get() {
        track()
        return store.state.Modules.DataNarrator.EditStepForm.stepZoomLevel;
      },
      set(newValue) {
        store.commit('Modules/DataNarrator/EditStepForm/setStepZoomLevel', newValue)
        trigger()
      }
    }
  });
  const interactionAddons = customRef((track, trigger) => {
    return {
      get() {
        track()
        return store.state.Modules.DataNarrator.EditStepForm.stepInteractionAddons;
      },
      set(newValue) {
        store.commit('Modules/DataNarrator/EditStepForm/setStepInteractionAddons', newValue)
        trigger()
      }
    }
  });
  const is3d = customRef((track, trigger) => {
    return {
      get() {
        track()
        return store.state.Modules.DataNarrator.EditStepForm.stepIs3d;
      },
      set(newValue) {
        store.commit('Modules/DataNarrator/EditStepForm/setStepIs3d', newValue)
        trigger()
      }
    }
  });
  const navigation3dId = customRef((track, trigger) => {
    return {
      get() {
        track()
        return store.state.Modules.DataNarrator.EditStepForm.stepNavigation3dId;
      },
      set(newValue) {
        store.commit('Modules/DataNarrator/EditStepForm/setStepNavigation3dId', newValue)
        trigger()
      }
    }
  });
  const backgroundMapId = customRef((track, trigger) => {
    return {
      get() {
        track()
        return store.state.Modules.DataNarrator.EditStepForm.stepBackgroundMapId;
      },
      set(newValue) {
        store.commit('Modules/DataNarrator/EditStepForm/setStepBackgroundMapId', newValue)
        trigger()
      }
    }
  });

  const cesiumEnabled = ref(true);
  const isValid = ref(false);

  const onSubmit = () => {
    console.log('Submit step form');
  }

  const onAddImage = () => {
    console.log('Add image');
  }

  const onRemoveImage = () => {
    console.log('Remove image');
  }

  const onDeleteStep = () => {
    console.log('delete step');
  }

  return {
    title,
    description,
    stepNumber,
    chapterId,
    width,
    visible,
    centerCoordinates,
    zoomLevel,
    interactionAddons,
    is3d,
    navigation3dId,
    backgroundMapId,

    cesiumEnabled,
    isValid,

    onSubmit,
    onAddImage,
    onRemoveImage,
    onDeleteStep
  };
}
