<script setup>
import { mdiCog } from '@mdi/js';
import { ref } from 'vue';

import DeleteAccountButton from './DeleteAccountButton.vue';

const menuOpen = ref(false);
</script>

<template>
  <v-menu
    v-model="menuOpen"
    :close-on-content-click="false"
    location="bottom end"
    offset="8"
  >
    <template
      #activator="{ props }"
    >
      <v-btn
        rounded
        size="small"
        elevation="0"
        v-bind="props"
      >
        <v-icon
          small
        >
          {{ mdiCog }}
        </v-icon>
      </v-btn>
    </template>

    <v-card
      min-width="200"
    >
      <v-list>
        <v-list-item>
          <DeleteAccountButton
            block
            size="small"
          />
        </v-list-item>
      </v-list>
    </v-card>
  </v-menu>
</template>

<style lang="scss" scoped>
</style>
