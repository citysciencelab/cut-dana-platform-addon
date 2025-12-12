<script setup>
import { mdiClose } from '@mdi/js';
import { ref, computed } from 'vue';

const props = defineProps({
    dialogOpen: { type: Boolean, required: true },
    okClicked: { type: Function, required: true },
    cancelClicked: { type: Function, required: true },
});
</script>

<template>
  <v-dialog
    v-model="props.dialogOpen"
    max-width="520"
  >
    <v-card>
      <v-card-title class="d-flex align-center">
        Datenschutz
        <v-spacer />
        <v-btn
          icon
          variant="text"
          @click="dialogOpen = false"
        >
          <v-icon :icon="mdiClose" />
        </v-btn>
      </v-card-title>

      <v-card-text>
        Die Daten werden beim Anbieter gespeichert und verarbeitet. Mit dem Speichern stimmen Sie der
        <a
          href="https://cut.io/datenschutz/"
          target="_blank"
          rel="noopener"
        >Datenschutzerklärung</a> zu.
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn
          variant="text"
          @click="props.okClicked"
        >
          Ok
        </v-btn>
        <v-btn
          variant="text"
          @click="props.cancelClicked"
        >
          Abbrechen
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
