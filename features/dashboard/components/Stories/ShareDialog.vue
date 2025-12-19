<script setup>
import { ref, watch, computed } from 'vue';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: 'Share story' },
  storyId: { type: Number, required: true },
});

const emit = defineEmits([ 'update:modelValue' ]);

const open = ref(props.modelValue);
watch(
  () => props.modelValue,
  (v) => (open.value = v)
);
watch(open, (v) => emit('update:modelValue', v));

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
    msg.value = 'Link copied';
  } catch {
    msg.value = 'Couldn’t copy link';
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
        {{ title }}
      </v-card-title>
      <v-card-text>
        <div class="mb-3 text-body-2">
          Anyone with this link can view the story
        </div>
        <v-text-field
          :model-value="url"
          label="Share link"
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
          Close
        </v-btn>
        <v-btn
          color="primary"
          @click="copy"
        >
          Copy link
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
