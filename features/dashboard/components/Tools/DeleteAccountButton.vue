<script setup>

import { mdiDelete } from '@mdi/js';
import { useTranslation } from 'i18next-vue';
import { ref, computed } from 'vue';

import { deleteMe } from '../../../me/hooks/useDeleteMe';
import { useLogin } from '../../hooks/useLogin';

const { t } = useTranslation();
const { username, logout } = useLogin();

const showConfirmDialog = ref(false);
const usernameInput = ref('');
const isDeleting = ref(false);
const errorMessage = ref('');

const isUsernameValid = computed(() => {
  return usernameInput.value === username.value;
});

const openDeleteDialog = () => {
  usernameInput.value = '';
  errorMessage.value = '';
  showConfirmDialog.value = true;
}

const deleteAccount = async () => {
  if (!isUsernameValid.value) return;

  isDeleting.value = true;
  errorMessage.value = '';

  try {
    await deleteMe();
    showConfirmDialog.value = false;
    logout();
    window.location.reload();
  } catch (error) {
    console.error('Error deleting account:', error);
    errorMessage.value = t('additional:modules.dataNarrator.deleteAccount.error');
  } finally {
    isDeleting.value = false;
  }
}
</script>

<template>
  <div>
    <v-btn
      v-bind="$attrs"
      elevation="0"
      @click="openDeleteDialog()"
    >
      <v-icon small>
        {{ mdiDelete }}
      </v-icon>
      {{ t("additional:modules.dataNarrator.deleteAccount.title") }}
    </v-btn>

    <v-dialog
      v-model="showConfirmDialog"
      max-width="500"
    >
      <v-card>
        <v-card-title class="text-h5">
          {{ t("additional:modules.dataNarrator.deleteAccount.title") }}
        </v-card-title>
        <v-card-text>
          <p>{{ t("additional:modules.dataNarrator.deleteAccount.text") }}</p>
          <p class="font-weight-bold mt-4">
            {{ t("additional:modules.dataNarrator.deleteAccount.confirmPrompt", { username: username }) }}
          </p>
          <v-text-field
            v-model="usernameInput"
            :label="t('additional:modules.dataNarrator.deleteAccount.usernamePlaceholder')"
            outlined
            dense
            class="mt-2"
            :disabled="isDeleting"
          />
          <v-alert
            v-if="errorMessage"
            type="error"
            dense
            class="mt-3"
          >
            {{ errorMessage }}
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            text
            :disabled="isDeleting"
            @click="showConfirmDialog = false"
          >
            {{ t("additional:modules.dataNarrator.deleteAccount.cancel") }}
          </v-btn>
          <v-btn
            color="error"
            text
            :disabled="!isUsernameValid || isDeleting"
            :loading="isDeleting"
            @click="deleteAccount()"
          >
            {{ t("additional:modules.dataNarrator.deleteAccount.confirm") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

