<script setup>
import { mdiDelete, mdiEye, mdiEyeOff, mdiMapMarker } from '@mdi/js';
import { computed } from 'vue';
import { useStore } from 'vuex';

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
        class="d-flex border py-2 px-3 rounded"
      >
        <div class="flex-1-0">
          {{ model.name }}
        </div>
        <div>
          <v-btn
            variant="flat"
            :icon="mdiMapMarker"
            size="compact"
            class="mr-2"
            @click="zoomTo(model.id)"
          />
          <v-btn
            variant="flat"
            :icon="model.show ? mdiEye : mdiEyeOff"
            size="compact"
            class="mr-2"
            @click="changeVisibility(model)"
          />
          <v-btn
            variant="flat"
            :icon="mdiDelete"
            size="compact"
            class="mr-2"
            @click="deleteModel(model.id)"
          />
        </div>
      </div>
    </div>
  </div>
</template>
