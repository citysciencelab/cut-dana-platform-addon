<!-- CategoryBrowser.vue -->
<script setup>
import { mdiChevronRight, mdiFileDocumentOutline, mdiFolderOutline } from '@mdi/js';
import { ref, computed } from 'vue';

const props = defineProps({
    items: { type: Array, required: true, default: () => [] },
    loading: { type: Boolean, default: false },
});

const emit = defineEmits([ 'select:layer' ]);

const stack = ref([]);
const searchQuery = ref('');

const matchingLayers = computed(() => {
    if (searchQuery.value.length < 3) return [];

    const query = searchQuery.value.toLowerCase();
    const matches = [];

    function searchInCategory(cat) {
        for (const sub of cat.subcategories ?? []) {
            for (const layer of sub.layers ?? []) {
                if (layer.name.toLowerCase().includes(query)) {
                    matches.push({ type: 'layer', cat, sub, layer });
                }
            }
        }
    }

    for (const cat of props.items ?? []) {
        searchInCategory(cat);
    }

    return matches;
});

const level = computed(() => stack.value.at(-1)?.level ?? 'root');

const currentCategory = computed(() =>
    level.value === 'category' || level.value === 'subcategory'
        ? stack.value[0]?.cat
        : null
);

const currentSubcategory = computed(() =>
    level.value === 'subcategory' ? stack.value[1]?.sub : null
);

const rows = computed(() => {
    if (level.value === 'root') {
        return (props.items ?? []).map((cat) => ({ type: 'category', cat }));
    }

    if (level.value === 'category') {
        const cat = currentCategory.value;
        return (cat?.subcategories ?? []).map((sub) => ({ type: 'subcategory', cat, sub }));
    }

    const cat = currentCategory.value;
    const sub = currentSubcategory.value;
    return (sub?.layers ?? []).map((layer) => ({ type: 'layer', cat, sub, layer }));
});

function enterCategory(cat) {
    stack.value = [ { level: 'category', cat } ];
}

function enterSubcategory(cat, sub) {
    stack.value = [ { level: 'category', cat }, { level: 'subcategory', cat, sub } ];
}

// function goBack() {
//     stack.value.pop();
// }

function goHome() {
    stack.value = [];
}

function onLayerClick(layer) {
    emit('select:layer', layer);
}
</script>

<template>
    <div v-if="loading">
        <v-skeleton-loader type="paragraph" />
    </div>
    <div
        v-else
        class="nav px-4"
    >
        <div class="nav-header mb-2">
            <div class="search">
                <input
                    type="text"
                    placeholder="Ebenen durchsuchen..."
                    class="w-full mb-2 p-2 border border-gray-300 rounded"
                    v-model="searchQuery"
                />
            </div>
            <div class="crumbs">
                <button
                    class="crumb"
                    :disabled="level==='root'"
                    @click="goHome"
                >
                    Datenquellen
                </button>
                <span
                    v-if="level!=='root'"
                    class="sep"
                >/</span>
                <template v-if="level==='category' || level==='subcategory'">
                <button
                    class="crumb"
                    @click="stack = [{ level: 'category', cat: currentCategory }]"
                >
                    {{ currentCategory?.category }}
                </button>
                </template>

                <template v-if="level==='subcategory'">
                <span class="sep">/</span>
                <span class="crumb current">{{ currentSubcategory?.name }}</span>
                </template>
            </div>
        </div>
        <div
            class="panel"
            role="list"
        >
        <button
            v-if="matchingLayers.length > 0"
            v-for="(match, i) in matchingLayers"
            :key="'search-' + i"
            class="panel-row search-result-row"
            role="listitem"
            @click="onLayerClick(match.layer)"
        >
            <span class="icon">
                <v-icon :icon="mdiFileDocumentOutline" />
            </span>
            <div>
                <div class="meta">
                    {{ match.cat.category }} >
                    {{ match.sub.name }}
                </div>
                <div class="label">{{ match.layer.name }}</div>
            </div>
        </button>
        <button
            v-if="matchingLayers.length === 0"
            v-for="(row, i) in rows"
            :key="i"
            class="panel-row"
            role="listitem"
            v-bind="row.type !== 'layer' ? { 'aria-haspopup': 'list' } : {}"
            @click="
            row.type==='category'
                ? enterCategory(row.cat)
                : row.type==='subcategory'
                ? enterSubcategory(row.cat, row.sub)
                : onLayerClick(row.layer)
            "
        >
            <span class="icon">
            <template v-if="row.type==='category'">
                <v-icon :icon="mdiFolderOutline" />
            </template>
            <template v-else-if="row.type==='subcategory'">
                <v-icon :icon="mdiFolderOutline" />
            </template>
            <template v-else>
                <v-icon :icon="mdiFileDocumentOutline" />
            </template>
            </span>

            <span class="label">
            <template v-if="row.type==='category'">{{ row.cat.category }}</template>
            <template v-else-if="row.type==='subcategory'">{{ row.sub.name }}</template>
            <template v-else>{{ row.layer.name }}</template>
            </span>

            <span
                v-if="row.type!=='layer'"
                class="meta"
            >
            <template v-if="row.type==='category'">{{ row.cat.subcategories?.length ?? 0 }}</template>
            <template v-else>{{ row.sub.layers?.length ?? 0 }}</template>
            </span>

            <v-icon
                v-if="row.type!=='layer'"
                :icon="mdiChevronRight"
            />
        </button>

        <p
            v-if="rows.length === 0"
            class="empty"
        >
            <span v-if="level==='root'">No categories available.</span>
            <span v-else-if="level==='category'">No subcategories in this folder.</span>
            <span v-else>No layers in this folder.</span>
        </p>
        </div>
    </div>
</template>

<style scoped lang="scss">
.nav {
    .nav-header {
        .crumbs {
            grid-column: 1 / -1;
            display: flex;
            align-items: center;
            gap: 6px;
            margin-top: 6px;

            .crumb {
                background: transparent;
                border: 0;
                color: #2f84ff;
                cursor: pointer;
                padding: 0;
                font-weight: 600;

                &[disabled] {
                    color: #999;
                    cursor: default;
                }

                &.current {
                    color: #111;
                    font-weight: 700;
                    cursor: default;
                }
            }
        }
    }

    .panel {
        width: 100%;

        .panel-row {
            width: 100%;
            display: grid;
            grid-template-columns: 28px 1fr auto 18px;
            align-items: center;
            gap: 8px;
            padding: 10px 12px;
            background: transparent;
            border: 0;
            text-align: left;
            cursor: pointer;
            border-radius: 4px;

            &:hover {
                background-color: #f1f1f1;
            }

            &.search-result-row .meta {
                font-size: 0.9em;
                color: grey;
            }
        }
    }
}
</style>
