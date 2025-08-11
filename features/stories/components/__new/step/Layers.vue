<script setup>
import {computed, ref, watch} from "vue";
import {mdiChevronRight, mdiEye, mdiMapMarkerPlusOutline, mdiPlus, mdiTrashCan} from "@mdi/js";
import {useStore} from "vuex";

const props = defineProps({ modelValue: { type: Array, default: () => [] } });
const emit  = defineEmits(["update:modelValue"]);

const dialogOpen = ref(false);
const selectedIds = ref([]);

const selectedLayers = computed(() =>
    informationLayers.value.filter(l => selectedIds.value.includes(l.id))
);

const store = useStore();
const allLayerConfigs = computed(() => store.getters["allLayerConfigs"]);

const baseLayerIds = computed(() => {
    const els = store.state.layerConfig?.baselayer?.elements ?? [];
    return new Set(els.map(e => String(e.id)));
});

const baseConfigs = computed(() => allLayerConfigs.value ?? []);

const informationLayers = computed(() => {
    const out = [];
    for (const conf of baseConfigs.value) {
        if (conf?.type === "layer" && conf?.showInLayerTree === true && conf?.isNeverVisibleInTree !== true) {
            out.push(conf);
        }

        if (Array.isArray(conf?.elements)) {
            for (const el of conf.elements) {
                if (el?.type === "layer" && el?.showInLayerTree === true) out.push(el);
            }
        }
    }
    return out;
});

const displayLayers = computed(() => {
    const list = informationLayers.value.slice();
    list.sort((a, b) => (b?.zIndex ?? 0) - (a?.zIndex ?? 0));
    return list;
});

function addLayer(layerOrId) {
    const id = typeof layerOrId === "string" ? layerOrId : layerOrId?.id;
    if (!id) return;
    if (!selectedIds.value.includes(id)) {
        selectedIds.value = [...selectedIds.value, id];
    }
    dialogOpen.value = false;
}

function removeLayer(id) {
    selectedIds.value = selectedIds.value.filter(v => v !== id);
}

watch(
    selectedIds,
    (newIds, oldIds) => {
        const prev = oldIds ?? [];
        const added = newIds.filter(id => !prev.includes(id));
        const removed = prev.filter(id => !newIds.includes(id));

        if (added.length) {
            const maxZ = Math.max(0, ...((allLayerConfigs.value ?? []).map(c => c?.zIndex ?? 0)));
            let z = maxZ;
            for (const id of added) {
                const layer =
                    (allLayerConfigs.value ?? []).find(c => c.id === id) ||
                    informationLayers.value.find(l => l.id === id);
                if (!layer) continue;
                z += 1;
                const next = { ...layer, visibility: true, zIndex: z };
                store.dispatch("Modules/LayerTree/replaceByIdInLayerConfig", next);
            }
        }

        for (const id of removed) {
            const layer =
                (allLayerConfigs.value ?? []).find(c => c.id === id) ||
                informationLayers.value.find(l => l.id === id);
            if (!layer) continue;
            const next = { ...layer, visibility: false };
            store.dispatch("Modules/LayerTree/replaceByIdInLayerConfig", next);
        }
    },
    { deep: false }
);

watch(
    selectedIds,
    (val) => {
        emit("update:modelValue", val);
    }
);
</script>

<template>
    <v-row class="mb-2" style="margin-top: 0!important;">
        <v-col cols="12" class="p-0">
            <v-list density="comfortable" class="pa-0">
                <v-list-item
                    v-for="l in selectedLayers"
                    :key="l.id ?? l.name"
                    class="pa-0"
                >
                    <v-sheet
                        width="100%"
                        rounded
                        class="d-flex align-center px-3 py-2"
                        style="border: 1px solid #e1e1e1"
                    >
                        <v-icon :icon="mdiEye" class="mr-2" />
                        <span class="flex-grow-1">{{ l.name }}</span>
                        <v-icon
                            :icon="mdiTrashCan"
                            class="cursor-pointer"
                            @click="removeLayer(l.id)"
                        />
                    </v-sheet>
                </v-list-item>

                <div
                    v-if="selectedLayers.length === 0"
                    class="text-medium-emphasis py-2"
                >
                    Keine Ebenen ausgewählt.
                </div>
            </v-list>
        </v-col>
    </v-row>

    <v-row class="mb-2" justify="center">
        <v-btn
            variant="flat"
            size="small"
            color="#b8e6c2"
            :prepend-icon="mdiMapMarkerPlusOutline"
            :append-icon="mdiChevronRight"
            rounded
            @click="dialogOpen = true"
        >
            Informationsebene hinzufügen
        </v-btn>
    </v-row>

    <v-dialog v-model="dialogOpen" max-width="520">
        <v-card>
            <v-card-title class="d-flex align-center">
                Informationsebene
                <v-spacer />
                <v-btn icon variant="text" @click="dialogOpen = false">
                    <v-icon :icon="mdiClose" />
                </v-btn>
            </v-card-title>

            <v-card-text>
                <v-list density="comfortable">
                    <v-list-item
                        v-for="l in displayLayers"
                        :key="l.id ?? l.name"
                        :title="l.name"
                        :disabled="baseLayerIds.has(String(l.id)) || selectedIds.includes(l.id)"
                    >
                        <template #append>
                            <v-btn
                                size="small"
                                variant="text"
                                :prepend-icon="mdiPlus"
                                :disabled="selectedLayers.some(s => s.id === l.id)"
                                @click="addLayer(l.id)"
                            >
                                Add layer
                            </v-btn>
                        </template>
                    </v-list-item>
                </v-list>
            </v-card-text>

            <v-card-actions>
                <v-spacer />
                <v-btn variant="text" @click="dialogOpen = false">Schließen</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
