<script setup>
import { mdiAccountOutline } from '@mdi/js';

import { onMounted, ref } from 'vue';

import { backendUrl } from '../../../../store/contantsDataNarrator.js';

const { authorId } = defineProps({
  authorId: {
    type: String,
    default: null
  }
});

const author = ref(null);
const isLoading = ref(false);

async function fetchAuthor(id) {
  if (!id) return;
  isLoading.value = true;
  try {
    const res = await fetch(`${backendUrl}/users/${id}`);
    author.value = await res.json();
  } catch (error) {
    console.error(error);
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  fetchAuthor(authorId);
});

</script>

<template>
  <div v-if="isLoading || !author">
    Loading...
  </div>
  <div v-else>
    <v-tooltip location="left">
      <template #activator="{ props }">
        <v-card-subtitle
          v-bind="props"
          class="card-subtitle author-display"
        >
          <v-icon small>
            {{ mdiAccountOutline }}
          </v-icon>
          {{ author.username }}
        </v-card-subtitle>
      </template>
      <span>
        {{
          author.email
        }}
      </span>
    </v-tooltip>
  </div>
</template>

<style scoped>
.author-display {
  padding: 2px 0;
  font-size: 0.8rem;
}
</style>
