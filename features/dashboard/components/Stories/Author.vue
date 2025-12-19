<script setup>
import { mdiAccountOutline } from '@mdi/js';

const props = defineProps({
  authorId: {
    type: String,
    default: null
  }
});
const isLoading = false;

fetchAuthor();

/**
 *
 */
function fetchAuthor () {
  console.log(`TODO: fetchAuthor by id ${props.authorId}`);
}

const author = {
  username: 'Loading',
  email: ''
};

</script>

<template>
  <div v-if="isLoading">
    Loading...
  </div>
  <div v-else>
    <v-tooltip top>
      <template>
        <v-card-subtitle class="card-subtitle">
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
