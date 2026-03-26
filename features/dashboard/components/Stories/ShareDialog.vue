<script setup>
import { ref, watch, computed } from 'vue';
import { useTranslation } from 'i18next-vue';

const { t } = useTranslation();

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: null },
  storyId: { type: Number, required: true },
});

const emit = defineEmits([ 'update:modelValue' ]);

const open = ref(props.modelValue);
watch(
  () => props.modelValue,
  (v) => (open.value = v)
);
watch(open, (v) => emit('update:modelValue', v));

const dialogTitle = computed(() =>
  props.title ?? t('additional:modules.dataNarrator.share.defaultTitle')
);

const url = computed(() => `${location.origin}/portal/stories/?id=${props.storyId}`);

const snackbar = ref(false);
const msg = ref('');

async function copy() {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url.value);
    } else {
      const el = document.createElement('textarea');
      el.value = url.value;
      el.setAttribute('readonly', '');
      el.style.position = 'absolute';
      el.style.left = '-9999px';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    msg.value = t('additional:modules.dataNarrator.share.linkCopied');
  } catch {
    msg.value = t('additional:modules.dataNarrator.share.copyFailed');
  } finally {
    snackbar.value = true;
  }
}
</script>

<template>
  <v-dialog
    v-model="open"
    max-width="520"
  >
    <v-card>
      <v-card-title class="text-h6">
        {{ dialogTitle }}
      </v-card-title>
      <v-card-text>
        <div class="mb-3 text-body-2">
          {{ t('additional:modules.dataNarrator.share.description') }}
        </div>
        <v-text-field
          :model-value="url"
          :label="t('additional:modules.dataNarrator.share.linkLabel')"
          variant="outlined"
          density="comfortable"
          readonly
          hide-details
        />
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn
          variant="text"
          @click="open = false"
        >
          {{ t('additional:modules.dataNarrator.button.close') }}
        </v-btn>
        <v-btn
          color="primary"
          @click="copy"
        >
          {{ t('additional:modules.dataNarrator.button.copyLink') }}
        </v-btn>
      </v-card-actions>
    </v-card>

    <v-snackbar
      v-model="snackbar"
      :timeout="1800"
    >
      {{ msg }}
    </v-snackbar>
  </v-dialog>
</template>
