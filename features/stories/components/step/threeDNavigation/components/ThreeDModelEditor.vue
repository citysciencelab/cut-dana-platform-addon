<script setup>
import { useTranslation } from 'i18next-vue';
import { computed, ref, watch } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const { t } = useTranslation();

// 'edit' open by default, 'position' closed
const openPanels = ref(['edit']);

const currentModelId = computed(() => store.getters['Modules/Modeler3D/currentModelId']);
const scale = computed(() => store.getters['Modules/Modeler3D/scale']);
const rotation = computed(() => store.getters['Modules/Modeler3D/rotation']);
const coordinateEasting = computed(() => store.getters['Modules/Modeler3D/coordinateEasting']);
const coordinateNorthing = computed(() => store.getters['Modules/Modeler3D/coordinateNorthing']);
const height = computed(() => store.getters['Modules/Modeler3D/height']);
const adaptToHeight = computed(() => store.getters['Modules/Modeler3D/adaptToHeight']);

// Local display values — updated on input, committed on apply
const scaleDisplay = ref((scale.value ?? 1).toFixed(1));
const rotationDisplay = ref(String(rotation.value ?? 0));
const eastingDisplay = ref(String(coordinateEasting.value ?? 0));
const northingDisplay = ref(String(coordinateNorthing.value ?? 0));
const heightDisplay = ref(String(height.value ?? 0));

watch(scale, (v) => { scaleDisplay.value = (v ?? 1).toFixed(1); });
watch(rotation, (v) => { rotationDisplay.value = String(v ?? 0); });
watch(coordinateEasting, (v) => { eastingDisplay.value = String(v ?? 0); });
watch(coordinateNorthing, (v) => { northingDisplay.value = String(v ?? 0); });
watch(height, (v) => { heightDisplay.value = String(v ?? 0); });

function updateImportedEntity(type, value) {
  const cloned = [...store.state.Modules.Modeler3D.importedEntities];
  cloned.forEach(e => {
    if (e?.entityId === currentModelId.value) e[type] = value;
  });
  store.commit('Modules/Modeler3D/setImportedEntities', cloned);
}

function applyScale() {
  let v = parseFloat(scaleDisplay.value);
  if (isNaN(v) || v < 0.1) v = 0.1;
  scaleDisplay.value = v.toFixed(1);
  store.commit('Modules/Modeler3D/setScale', v);
  const entities = mapCollection.getMap('3D').getDataSourceDisplay().defaultDataSource.entities;
  const entity = entities.getById(currentModelId.value);
  if (entity?.model) entity.model.scale = v;
  updateImportedEntity('scale', v);
}

function applyRotation() {
  let v = parseInt(rotationDisplay.value, 10);
  if (isNaN(v)) v = 0;
  if (v < -180) v = -180;
  if (v > 180) v = 180;
  rotationDisplay.value = String(v);
  store.commit('Modules/Modeler3D/setRotation', v);
  updateImportedEntity('rotation', v);

  // Apply rotation directly to Cesium entity orientation (same as original rotate() method)
  try {
    const entities = mapCollection.getMap('3D').getDataSourceDisplay().defaultDataSource.entities;
    const entity = entities.getById(currentModelId.value);
    if (entity && entity.position) {
      const heading = Cesium.Math.toRadians(v);
      const position = entity.position.getValue();
      if (position) {
        const orientationMatrix = Cesium.Transforms.headingPitchRollQuaternion(
          position,
          new Cesium.HeadingPitchRoll(heading, 0, 0)
        );
        entity.orientation = orientationMatrix;
        // Also update importedModels heading for persistence
        const clonedModels = [...store.state.Modules.Modeler3D.importedModels];
        const modelEntry = clonedModels.find(m => m.id === currentModelId.value);
        if (modelEntry) modelEntry.heading = v;
        store.commit('Modules/Modeler3D/setImportedModels', clonedModels);
      }
    }
  }
  catch (e) {
    // ignore if 3D map not ready
  }
}

function applyCoordinates() {
  const e = parseFloat(eastingDisplay.value);
  const n = parseFloat(northingDisplay.value);
  const h = parseFloat(heightDisplay.value);
  if (!isNaN(e)) store.commit('Modules/Modeler3D/setCoordinateEasting', e);
  if (!isNaN(n)) store.commit('Modules/Modeler3D/setCoordinateNorthing', n);
  if (!isNaN(h)) store.commit('Modules/Modeler3D/setHeight', h);
  store.dispatch('Modules/Modeler3D/updateEntityPosition');
}

function applyHeight() {
  const h = parseFloat(heightDisplay.value);
  if (!isNaN(h)) {
    store.commit('Modules/Modeler3D/setHeight', h);
    // manual height entry disables adapt-to-terrain
    if (adaptToHeight.value) {
      store.commit('Modules/Modeler3D/setAdaptToHeight', false);
      try {
        const entities = mapCollection.getMap('3D').getDataSourceDisplay().defaultDataSource.entities;
        const entity = entities.getById(currentModelId.value);
        if (entity) entity.clampToGround = false;
      }
      catch (e) { /* ignore */ }
    }
  }
  store.dispatch('Modules/Modeler3D/updateEntityPosition');
}

function toggleAdaptToHeight(val) {
  store.commit('Modules/Modeler3D/setAdaptToHeight', val);
  try {
    const entities = mapCollection.getMap('3D').getDataSourceDisplay().defaultDataSource.entities;
    const entity = entities.getById(currentModelId.value);
    if (entity) entity.clampToGround = val;
  }
  catch (e) {
    // ignore if 3D map not ready
  }
  store.dispatch('Modules/Modeler3D/updateEntityPosition');
}

// Steppers: apply immediately when value changes via arrows
function onScaleChange(e) {
  scaleDisplay.value = e.target.value;
  applyScale();
}

function onRotationChange(e) {
  rotationDisplay.value = e.target.value;
  applyRotation();
}

function onEastingChange(e) {
  eastingDisplay.value = e.target.value;
  applyCoordinates();
}

function onNorthingChange(e) {
  northingDisplay.value = e.target.value;
  applyCoordinates();
}

function onHeightChange(e) {
  heightDisplay.value = e.target.value;
  applyHeight();
}
</script>

<template>
  <v-expansion-panels
    v-model="openPanels"
    multiple
    variant="accordion"
    class="mt-2 model-editor"
  >
    <!-- Editieren: Rotation + Scale -->
    <v-expansion-panel value="edit">
      <v-expansion-panel-title class="editor-panel-title">
        {{ t('additional:modules.dataNarrator.label.edit3D') }}
      </v-expansion-panel-title>
      <v-expansion-panel-text class="editor-panel-body">
        <v-row dense>
          <v-col cols="6">
            <label class="field-label">{{ t('additional:modules.dataNarrator.label.rotation3D') }} [°]</label>
            <input
              v-model="rotationDisplay"
              type="number"
              step="1"
              min="-180"
              max="180"
              class="compact-input"
              @blur="applyRotation"
              @keydown.enter.prevent="applyRotation"
              @change="onRotationChange"
            >
          </v-col>
          <v-col cols="6">
            <label class="field-label">{{ t('additional:modules.dataNarrator.label.scale3D') }}</label>
            <input
              v-model="scaleDisplay"
              type="number"
              step="0.1"
              min="0.1"
              class="compact-input"
              @blur="applyScale"
              @keydown.enter.prevent="applyScale"
              @change="onScaleChange"
            >
          </v-col>
        </v-row>
      </v-expansion-panel-text>
    </v-expansion-panel>

    <!-- Position: Easting, Northing, Height, AdaptToHeight -->
    <v-expansion-panel value="position">
      <v-expansion-panel-title class="editor-panel-title">
        {{ t('additional:modules.dataNarrator.label.position3D') }}
      </v-expansion-panel-title>
      <v-expansion-panel-text class="editor-panel-body">
        <v-row dense>
          <v-col cols="6">
            <label class="field-label">{{ t('additional:modules.dataNarrator.label.easting3D') }}</label>
            <input
              v-model="eastingDisplay"
              type="number"
              step="0.01"
              class="compact-input"
              @blur="applyCoordinates"
              @keydown.enter.prevent="applyCoordinates"
              @change="onEastingChange"
            >
          </v-col>
          <v-col cols="6">
            <label class="field-label">{{ t('additional:modules.dataNarrator.label.northing3D') }}</label>
            <input
              v-model="northingDisplay"
              type="number"
              step="0.01"
              class="compact-input"
              @blur="applyCoordinates"
              @keydown.enter.prevent="applyCoordinates"
              @change="onNorthingChange"
            >
          </v-col>
        </v-row>
        <v-row dense class="mt-1">
          <v-col cols="6">
            <label class="field-label">{{ t('additional:modules.dataNarrator.label.height3D') }} [m]</label>
            <input
              v-model="heightDisplay"
              type="number"
              step="1"
              class="compact-input"
              @blur="applyHeight"
              @keydown.enter.prevent="applyHeight"
              @change="onHeightChange"
            >
          </v-col>
          <v-col cols="6" class="d-flex align-center pt-3">
            <label class="field-label d-flex align-center ga-1" style="cursor:pointer">
              <input
                type="checkbox"
                :checked="adaptToHeight"
                @change="toggleAdaptToHeight($event.target.checked)"
              >
              {{ t('additional:modules.dataNarrator.label.adaptToHeight3D') }}
            </label>
          </v-col>
        </v-row>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<style scoped lang="scss">
.model-editor {
  :deep(.v-expansion-panel-title) {
    padding: 4px 8px;
    min-height: 32px;
    font-size: 0.82rem;
    font-weight: 600;
  }

  :deep(.v-expansion-panel-text__wrapper) {
    padding: 6px 8px;
  }
}

.field-label {
  display: block;
  font-size: 0.76rem;
  color: rgba(0,0,0,0.6);
  margin-bottom: 2px;
  user-select: none;
}

.compact-input {
  width: 100%;
  border: 1px solid rgba(0,0,0,0.38);
  border-radius: 4px;
  padding: 3px 6px;
  font-size: 0.82rem;
  outline: none;
  background: white;

  &:focus {
    border-color: #1867c0;
  }

  // hide browser default spin buttons, show only on hover/focus
  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    opacity: 0.6;
  }
}
</style>
