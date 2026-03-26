<script setup>
import { computed } from 'vue';
import { useTranslation } from 'i18next-vue';

const { t } = useTranslation();

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: null },
  message: { type: String, default: null },
  confirmText: { type: String, default: null },
  cancelText: { type: String, default: null },
  destructive: { type: Boolean, default: false },
  width: { type: [ Number, String ], default: 420 },
});

const emit = defineEmits([ 'update:modelValue', 'confirm', 'cancel' ]);

const open = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
});

const displayTitle = computed(() => props.title ?? t('additional:modules.dataNarrator.dialog.confirmTitle'));
const displayMessage = computed(() => props.message ?? t('additional:modules.dataNarrator.dialog.confirmMessage'));
const displayConfirmText = computed(() => props.confirmText ?? t('additional:modules.dataNarrator.dialog.confirmYes'));
const displayCancelText = computed(() => props.cancelText ?? t('additional:modules.dataNarrator.dialog.confirmCancel'));

function onConfirm() {
  emit('confirm');
  open.value = false;
}

function onCancel() {
  emit('cancel');
  open.value = false;
}
</script>

<template>
  <v-dialog
    v-model="open"
    :width="width"
    persistent
  >
    <v-card
      rounded="md"
      :title="displayTitle"
      :text="displayMessage"
    >
      <template #actions>
        <v-btn
          variant="text"
          @click="onCancel"
        >
          {{ displayCancelText }}
        </v-btn>

        <v-btn
          :color="destructive ? 'error' : 'primary'"
          @click="onConfirm"
        >
          {{ displayConfirmText }}
        </v-btn>
      </template>
    </v-card>
  </v-dialog>
</template>
