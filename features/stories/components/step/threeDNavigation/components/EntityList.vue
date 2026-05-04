<script setup>
import { mdiDelete, mdiEye, mdiEyeOff, mdiHandPointingUp, mdiMapMarker, mdiPencil } from '@mdi/js';
import { computed } from 'vue';
import { useStore } from 'vuex';

import ThreeDModelEditor from './ThreeDModelEditor.vue';

defineProps({
  editingModelId: {
    type: [ String, Number ],
    default: null,
  },
});

const emit = defineEmits([ 'edit' ]);

const store = useStore();

const importedModels = computed(() => store.getters['Modules/Modeler3D/importedModels']);

function changeVisibility(model) {
  const entities = mapCollection.getMap('3D').getDataSourceDisplay().defaultDataSource.entities,
    entity = entities.getById(model.id);

  entity.show = !model.show;
  model.show = entity.show;
}

function zoomTo(id) {
  const scene = mapCollection.getMap('3D').getCesiumScene(),
    entities = mapCollection.getMap('3D').getDataSourceDisplay().defaultDataSource.entities,
    entity = entities.getById(id),
    entityPosition = entity.position.getValue(),
    destination = Cesium.Cartographic.fromCartesian(entityPosition);

  scene.camera.flyTo({
    destination: Cesium.Cartesian3.fromRadians(destination.longitude, destination.latitude, destination.height + 250)
  });
}

function activateMove(id) {
  store.commit('Modules/Modeler3D/setCurrentModelId', id);
  store.commit('Modules/Modeler3D/setMovingEntity', true);
}

function deleteModel(id) {
  store.dispatch('Modules/Modeler3D/deleteEntity', id);
}
</script>

<template>
  <div v-if="importedModels.length > 0">
    <div class="mb-2">
      Imported 3D Models
    </div>

    <div class="d-flex flex-column ga-2">
      <div
        v-for="model in importedModels"
        :key="model.id"
      >
        <div
          class="model-row border py-2 px-3 rounded"
          :class="{ 'border-primary': editingModelId === model.id }"
        >
          <div
            class="model-name"
            :title="model.name"
          >
            {{ model.name }}
          </div>
          <div class="model-actions">
            <!-- Row 1: move, zoom, visibility -->
            <div class="d-flex">
              <v-btn
                variant="flat"
                :icon="mdiHandPointingUp"
                size="compact"
                class="mr-1"
                title="Objekt verschieben"
                @click="activateMove(model.id)"
              />
              <v-btn
                variant="flat"
                :icon="mdiMapMarker"
                size="compact"
                class="mr-1"
                title="Zoom to"
                @click="zoomTo(model.id)"
              />
              <v-btn
                variant="flat"
                :icon="model.show ? mdiEye : mdiEyeOff"
                size="compact"
                title="Sichtbarkeit"
                @click="changeVisibility(model)"
              />
            </div>
            <!-- Row 2: edit, delete -->
            <div class="d-flex">
              <v-btn
                :variant="editingModelId === model.id ? 'tonal' : 'flat'"
                :icon="mdiPencil"
                size="compact"
                class="mr-1"
                :color="editingModelId === model.id ? 'primary' : undefined"
                title="Bearbeiten"
                @click="emit('edit', model.id)"
              />
              <v-btn
                variant="flat"
                :icon="mdiDelete"
                size="compact"
                title="Löschen"
                @click="deleteModel(model.id)"
              />
            </div>
          </div>
        </div>

        <!-- Inline editor shown under the active model -->
        <ThreeDModelEditor v-if="editingModelId === model.id" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.model-row {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 8px;
}

.model-name {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: 0.82rem;
}

.model-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
}
</style>
