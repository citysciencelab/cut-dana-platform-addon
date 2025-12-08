import { computed } from 'vue';
import { useStore } from 'vuex';

export function useStepOverlays() {
    const store = useStore();

    const allLayerConfigs = computed(() => store.getters['allLayerConfigs'] ?? []);

    const appliedIds = new Set();
    const prevState = new Map();

    const norm = (id) => String(id);

    function applyForStep(step) {
        if (!allLayerConfigs.value?.length) return;

        const targetIds = (step?.informationLayerIds ?? []).map(norm);
        const maxZ = Math.max(0, ...allLayerConfigs.value.map(c => c?.zIndex ?? 0));
        let z = maxZ;

        allLayerConfigs.value
            .filter(cfg => targetIds.includes(norm(cfg.id)))
            .forEach(cfg => {
                const id = norm(cfg.id);

                if (!prevState.has(id)) {
                    prevState.set(id, { visibility: !!cfg.visibility, zIndex: cfg.zIndex ?? 0 });
                }

                z += 1;
                const next = { ...cfg, visibility: true, zIndex: z };
                store.dispatch('Modules/LayerTree/replaceByIdInLayerConfig', next);

                appliedIds.add(id);
            });
    }

    function clear() {
        if (!appliedIds.size || !allLayerConfigs.value?.length) return;

        const byId = new Map(allLayerConfigs.value.map(c => [ norm(c.id), c ]));

        for (const id of appliedIds) {
            const cfg = byId.get(id);
            if (!cfg) continue;

            const prev = prevState.get(id) ?? { visibility: false, zIndex: 0 };
            const next = { ...cfg, visibility: prev.visibility, zIndex: prev.zIndex };
            store.dispatch('Modules/LayerTree/replaceByIdInLayerConfig', next);
        }

        appliedIds.clear();
        prevState.clear();
    }

    return { applyForStep, clear };
}
