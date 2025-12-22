<script setup>
import { useTranslation } from 'i18next-vue';
import { computed } from 'vue';

const props = defineProps({
  dialogOpen: { type: Boolean, required: true },
  okClicked: { type: Function, required: true },
  cancelClicked: { type: Function, required: true },
});

const emit = defineEmits([ 'update:dialogOpen' ]);

const { t } = useTranslation();

const dialogModel = computed({
  get: () => props.dialogOpen,
  set: (value) => emit('update:dialogOpen', value),
});
</script>

<template>
  <v-dialog
    v-model="dialogModel"
    max-width="520"
  >
    <v-card>
      <v-card-title class="d-flex align-center">
        {{ t('additional:modules.dataNarrator.confirm.createStoryDataProtectionNotice.title') }}
      </v-card-title>

      <v-card-text>
        <i18next
          :translation="$t('additional:modules.dataNarrator.confirm.createStoryDataProtectionNotice.description')"
        >
          <template
            #termsOfUseLink
          >
            <a
              :href="$t('additional:modules.dataNarrator.confirm.createStoryDataProtectionNotice.termsOfUseLinkHref')"
              target="_blank"
              rel="noopener"
            >
              {{ $t('additional:modules.dataNarrator.confirm.createStoryDataProtectionNotice.termsOfUseLinkTitle') }}
            </a>
          </template>
        </i18next>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn
          variant="text"
          @click="props.cancelClicked"
        >
          {{ t('additional:modules.dataNarrator.confirm.createStoryDataProtectionNotice.denyButton') }}
        </v-btn>
        <v-btn
          variant="text"
          @click="props.okClicked"
        >
          {{ t('additional:modules.dataNarrator.confirm.createStoryDataProtectionNotice.confirmButton') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
