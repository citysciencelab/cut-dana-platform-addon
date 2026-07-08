<!-- CategoryBrowser.vue -->
<script setup>
import { mdiChevronRight, mdiFolderOutline, mdiHomeOutline } from '@mdi/js';
import { useTranslation } from 'i18next-vue';
import { computed, ref, watch } from 'vue';

const props = defineProps({
  items: { type: Array, required: false, default: () => [] },
  loading: { type: Boolean, default: false },
  selectedIds: { type: Array, default: () => [] }
});

const { t } = useTranslation();

const emit = defineEmits([ 'select:layer', 'deselect:layer', 'select:layers', 'deselect:layers' ]);

const stack = ref([]);
const searchQuery = ref();

// Auto-skip root if there's only one category (and skip subcategory if it also has only one)
watch(
  () => props.items,
  (items) => {
    if (stack.value.length === 0 && (items ?? []).length === 1) {
      enterCategory(items[0]);
    }
  },
  { immediate: true }
);

const searchResultLayers = computed(() => {
  const queryString = searchQuery.value;
  if (!queryString || queryString.length < 3) return [];

  const query = queryString.toLowerCase();
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

const hasSearchResultLayers = computed(() => searchResultLayers.value.length > 0);

const level = computed(() => stack.value.at(-1)?.level ?? 'root');

const currentCategory = computed(() => {
  if (hasSearchResultLayers.value) {
    return null;
  }
  if (level.value === 'category' || level.value === 'subcategory') {
    return stack.value[0]?.cat;
  }
  return null;
});

const currentSubcategoryLayers = computed(() => currentSubcategory.value?.layers ?? []);

// layers inside the current category (flattened)
const currentCategoryLayers = computed(() => {
  const cat = currentCategory.value;
  if (!cat) return [];
  return (cat.subcategories ?? []).flatMap(s => s.layers ?? []).slice().sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
});

const allSelectedInSub = computed(() => {
  const layers = level.value === 'subcategory' ? currentSubcategoryLayers.value : (level.value === 'category' ? currentCategoryLayers.value : []);
  if (!layers.length) return false;
  return layers.every(l => isSelected(l.id));
});

const someSelectedInSub = computed(() => {
  const layers = level.value === 'subcategory' ? currentSubcategoryLayers.value : (level.value === 'category' ? currentCategoryLayers.value : []);
  if (!layers.length) return false;
  return layers.some(l => isSelected(l.id)) && !allSelectedInSub.value;
});

const showSelectAll = computed(() => {
  // Never show on root level
  if (level.value === 'root') return false;

  // Subcategory view: always show if there are layers (only layers are shown here, no subfolders)
  if (level.value === 'subcategory') {
    return currentSubcategoryLayers.value.length > 0;
  }

  // Category view: show only when there are no folders (all subcategories have ≤1 layer)
  if (level.value === 'category') {
    const subs = currentCategory.value?.subcategories ?? [];
    const hasFolders = subs.some(s => (s.layers?.length ?? 0) > 1);
    return !hasFolders && currentCategoryLayers.value.length > 0;
  }

  return false;
});

const currentSubcategory = computed(() => {
  if (hasSearchResultLayers.value) {
    return null;
  }
  if (level.value === 'subcategory') {
    return stack.value[1]?.sub;
  }
  return null;
});

const rows = computed(() => {
  if (level.value === 'root') {
    return (props.items ?? []).map((cat) => ({ type: 'category', cat }));
  }

  if (level.value === 'category') {
    const cat = currentCategory.value;
    const subs = cat?.subcategories ?? [];
    // folders: subcategories with more than one layer, sorted by subcategory name
    const folders = subs
      .filter(s => (s.layers?.length ?? 0) > 1)
      .slice()
      .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))
      .map((sub) => ({ type: 'subcategory', cat, sub }));

    // single layers: subcategories with exactly one layer -> show the single layer at the end, sorted by layer name
    const singles = subs
      .filter(s => (s.layers?.length ?? 0) === 1)
      .map(s => ({ type: 'layer', cat, sub: s, layer: s.layers[0] }))
      .slice()
      .sort((a, b) => (a.layer?.name ?? '').localeCompare(b.layer?.name ?? ''));

    return [ ...folders, ...singles ];
  }

  const cat = currentCategory.value;
  const sub = currentSubcategory.value;
  // ensure layers are alphabetically sorted in subcategory view
  const sortedLayers = (sub?.layers ?? []).slice().sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
  return sortedLayers.map((layer) => ({ type: 'layer', cat, sub, layer }));
});

function enterCategory(cat) {
  if ((cat.subcategories ?? []).length === 1) {
    stack.value = [
      { level: 'category', cat },
      { level: 'subcategory', cat, sub: cat.subcategories[0] },
    ];
  } else {
    stack.value = [ { level: 'category', cat } ];
  }
}

function enterSubcategory(cat, sub) {
  stack.value = [ { level: 'category', cat }, { level: 'subcategory', cat, sub } ];
}

function goHome() {
  stack.value = [];
  if ((props.items ?? []).length === 1) {
    enterCategory(props.items[0]);
  }
}

function isSelected(layerId) {
  return props.selectedIds.includes(layerId);
}

function onLayerClick(layer) {
  if (isSelected(layer.id)) {
    emit('deselect:layer', layer);
  } else {
    emit('select:layer', layer);
  }
}

function toggleSelectAllInCurrentSub() {
  let layers = [];
  if (level.value === 'subcategory') {
    layers = currentSubcategoryLayers.value;
  } else if (level.value === 'category') {
    // when category view shows only single layers (no folders), allow selecting all of them
    layers = currentCategoryLayers.value;
  }

  if (!layers.length) return;
  if (allSelectedInSub.value) {
    // deselect all (batch)
    emit('deselect:layers', layers);
  } else {
    // select all (batch)
    emit('select:layers', layers);
  }
}

function selectAllInSubExplicit(sub) {
  const layers = (sub?.layers ?? []) || [];
  if (!layers.length) return;
  emit('select:layers', layers);
}

function deselectAllInSubExplicit(sub) {
  const layers = (sub?.layers ?? []) || [];
  if (!layers.length) return;
  emit('deselect:layers', layers);
}

</script>

<template>
  <div v-if="loading">
    <v-skeleton-loader type="paragraph" />
  </div>
  <div
    v-else
    class="nav px-0"
  >
    <div class="nav-header mb-2 w-100">
      <div class="search">
        <v-text-field
          id="search-layers"
          v-model="searchQuery"
          :label="t('additional:modules.dataNarrator.categoryBrowser.searchLayers')"
          variant="outlined"
          clearable
        />
      </div>
      <div class="crumbs">
        <button
          class="crumb"
          :class="{ current: level === 'root' && !hasSearchResultLayers }"
          :disabled="level==='root'"
          @click="goHome"
        >
          <v-icon :icon="mdiHomeOutline" />
        </button>
        <template v-if="!hasSearchResultLayers">
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
        </template>
      </div>
    </div>
    <div
      class="panel"
      role="list"
    >
      <template v-if="searchQuery?.length > 3 && !hasSearchResultLayers">
        <p class="empty">
          {{ t('additional:modules.dataNarrator.categoryBrowser.noResultsFound', {query: searchQuery}) }}
        </p>
      </template>
      <template v-else-if="hasSearchResultLayers">
        <button
          v-for="(match, i) in searchResultLayers"
          :key="'search-' + i"
          class="panel-row search-result-row"
          :class="{ 'is-selected': isSelected(match.layer.id) }"
          @click="onLayerClick(match.layer)"
        >
          <span class="icon">
            <v-checkbox-btn
              :model-value="isSelected(match.layer.id)"
              density="compact"
              hide-details
              @click.stop="onLayerClick(match.layer)"
            />
          </span>
          <span>
            <span class="meta d-block">
              {{ match.cat.category }} >
              {{ match.sub.name }}
            </span>
            <span class="label d-block">
              {{ match.layer.name }}
            </span>
          </span>
        </button>
      </template>
      <template v-else>
        <!-- Show select-all at top of subcategory view when configured -->
        <div
          v-if="showSelectAll"
          class="select-all-row"
        >
          <v-checkbox-btn
            :model-value="allSelectedInSub"
            :indeterminate="someSelectedInSub"
            density="compact"
            hide-details
            @click.stop="toggleSelectAllInCurrentSub"
          />
          <button
            class="select-all-label"
            @click.stop="toggleSelectAllInCurrentSub"
          >
            {{ t('additional:modules.dataNarrator.categoryBrowser.selectAll') }}
          </button>
        </div>

        <button
          v-for="(row, i) in rows"
          :key="i"
          class="panel-row"
          :class="{ 'is-selected': row.type === 'layer' && isSelected(row.layer?.id) }"
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
              <v-checkbox-btn
                :model-value="isSelected(row.layer.id)"
                density="compact"
                hide-details
                @click.stop="onLayerClick(row.layer)"
              />
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
      </template>
      <p
        v-if="rows.length === 0 && !hasSearchResultLayers"
        class="empty"
      >
        <span v-if="level==='root'">{{
          t('additional:modules.dataNarrator.categoryBrowser.noCategoriesAvailable')
        }}</span>
        <span v-else-if="level==='category'">{{
          t('additional:modules.dataNarrator.categoryBrowser.noSubcategoriesInFolder')
        }}</span>
        <span v-else>{{ t('additional:modules.dataNarrator.categoryBrowser.noLayersInFolder') }}</span>
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
        display: inline-flex;
        align-items: center;
        justify-content: center;

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

    .select-all-row {
      display: flex;
      grid-template-columns: 28px 1fr;
      align-items: center;
      gap: 8px;
      padding: 2px 0;
      margin-bottom: 4px;
      border-bottom: 1px solid #eee;
    }

    .select-all-label {
      background: transparent;
      border: 0;
      color: #2f84ff;
      cursor: pointer;
      font-weight: 600;
      text-align: left;
      font-size: 0.875rem;
      line-height: 1.4;
      padding: 0;
    }

    .panel-row {
      width: 100%;
      display: grid;
      grid-template-columns: 28px 1fr auto 18px;
      align-items: center;
      gap: 8px;
      padding: 0;
      background: transparent;
      border: 0;
      text-align: left;
      cursor: pointer;
      border-radius: 4px;

      &.is-selected {
        background-color: #f0f4ff;
      }

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
