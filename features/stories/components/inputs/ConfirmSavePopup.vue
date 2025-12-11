<!-- CategoryBrowser.vue -->
<script setup>
import {ref, computed} from 'vue';
import {mdiClose} from "@mdi/js";

const props = defineProps({
    dialogOpen: {type: Boolean, required: true},
    okClicked: {type: Function, required: true},
    cancelClicked: {type: Function, required: true},
});
</script>

<template>
    <v-dialog v-model="props.dialogOpen" max-width="520">
    <v-card>
      <v-card-title class="d-flex align-center">
        Datenschutz
        <v-spacer/>
        <v-btn icon variant="text" @click="dialogOpen = false">
          <v-icon :icon="mdiClose"/>
        </v-btn>
      </v-card-title>

      <v-card-text>
        Die Daten werden beim Anbieter gespeichert und verarbeitet. Mit dem Speichern stimmen Sie der
        <a href="https://cut.io/datenschutz/" target="_blank" rel="noopener">Datenschutzerklärung</a> zu.
      </v-card-text>

      <v-card-actions>
        <v-spacer/>
        <v-btn variant="text" @click="props.okClicked">Ok</v-btn>
        <v-btn variant="text" @click="props.cancelClicked">Abbrechen</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped lang="scss">
.nav {
    &-header {
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

        &-row {
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
        }
    }
}
</style>
