<script setup>
import { useTranslation } from 'i18next-vue';
import Quill from 'quill';
import { computed, onBeforeUnmount, ref } from 'vue';
import { VueEditor } from 'vue3-editor';

import * as constants from '../../../../store/contantsDataNarrator';
import { backendUrl } from '../../../../store/contantsDataNarrator';
import { createLogger } from '../../../../utils/logger.js';
import { fixLinksInHTMLString } from '../../../../utils/stringUtils';

// ---------------------------------------------------------------------------
// Custom IframeBlot — renders a raw <iframe> embed in the editor
// ---------------------------------------------------------------------------
const BlockEmbed = Quill.import('blots/block/embed');

class IframeBlot extends BlockEmbed {
  static create(value) {
    const node = super.create();
    node.setAttribute('src', value.src);
    if (value.allow) node.setAttribute('allow', value.allow);
    if (value.allowfullscreen) node.setAttribute('allowfullscreen', '');
    node.setAttribute('style', 'width:100%;max-width:600px;aspect-ratio:16/9;border:0;');
    return node;
  }

  static value(node) {
    return {
      src: node.getAttribute('src'),
      allow: node.getAttribute('allow') || '',
      allowfullscreen: node.hasAttribute('allowfullscreen'),
    };
  }
}

IframeBlot.blotName = 'iframe';
IframeBlot.tagName = 'iframe';

Quill.register(IframeBlot);

const logger = createLogger('StepDescription.vue');

const props = defineProps({
  value: {
    type: String,
    default: '',
  },
  error: {
    type: Boolean,
    default: false
  }
});
const emit = defineEmits([ 'update:value' ]);
const inputValue = computed({
  get() {
    return props.value
  },
  set(v) {
    emit('update:value', fixLinksInHTMLString(v))
  }
});

const editorRef = ref(null);
const latestUploadRequestId = ref(0);

defineExpose({
  focus() {
    // Quill editor element is inside the vue-editor wrapper
    const ql = editorRef.value?.$el?.querySelector('.ql-editor');
    ql?.focus();
  }
});

const { t } = useTranslation();

function getQuill() {
  return editorRef.value?.quill ?? null;
}

function getSafeEditorIndex(quill, index = 0) {
  const maxIndex = Math.max(quill.getLength() - 1, 0);
  return Math.min(Math.max(index, 0), maxIndex);
}

onBeforeUnmount(() => {
  latestUploadRequestId.value += 1;
});

/**
 * Uploads an image File to the backend file storage and returns the URL
 * that can be embedded in the editor content.
 */
async function uploadImageFile(file) {
  const form = new FormData();
  form.append('files', file);
  const resp = await fetch(`${backendUrl}/files/story-images`, {
    method: 'POST',
    // Set Content-Type to null so FetchInterceptor removes it — the browser will
    // then set multipart/form-data with the correct boundary automatically.
    headers: { 'Content-Type': null },
    body: form,
  });
  if (!resp.ok) {
    throw new Error(`Image upload failed: ${resp.status}`);
  }
  const data = await resp.json();
  return `${backendUrl}/files/${data.fileContext}/${data.filename}`;
}

/**
 * Custom Quill image handler: opens a file picker, uploads to the backend,
 * then inserts a URL-based <img> — no base64 in the editor content.
 */
function handleImageUpload() {
  const quill = getQuill();
  if (!quill) return;
  const range = quill.getSelection();
  const insertIndex = getSafeEditorIndex(quill, range?.index ?? quill.getLength() - 1);

  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.click();

  input.onchange = async () => {
    const file = input.files?.[0];
    if (!file) return;
    const uploadRequestId = ++latestUploadRequestId.value;

    try {
      const url = await uploadImageFile(file);
      const activeQuill = getQuill();

      if (!activeQuill || uploadRequestId !== latestUploadRequestId.value) {
        return;
      }

      const safeIndex = getSafeEditorIndex(activeQuill, insertIndex);

      // The file picker moves focus away from the editor. Clearing the native
      // selection before mutating Quill avoids stale range updates.
      activeQuill.setSelection(null, 'silent');
      activeQuill.insertEmbed(safeIndex, 'image', url, 'api');
    } catch (err) {
      logger.error('Image upload failed:', err);
    }
  };
}

/**
 * Handles iframe embedding — prompts for a raw embed code, parses src and
 * attributes, then inserts a custom IframeBlot into the editor.
 * Accepts embed snippets from YouTube, Vimeo, Spotify, SoundCloud, etc.
 */
function handleIframeEmbed() {
  const quill = getQuill();
  if (!quill) return;
  const range = quill.getSelection();
  const insertIndex = getSafeEditorIndex(quill, range?.index ?? quill.getLength() - 1);


  const raw = prompt(t('additional:modules.dataNarrator.editor.iframePrompt'));
  if (!raw) return;

  const srcMatch = raw.match(/src=["']([^"']+)["']/i);
  const allowMatch = raw.match(/allow=["']([^"']+)["']/i);
  const hasFullscreen = /allowfullscreen/i.test(raw);

  if (!srcMatch) {

    alert(t('additional:modules.dataNarrator.editor.iframeInvalid'));
    return;
  }

  quill.insertEmbed(insertIndex, 'iframe', {
    src: srcMatch[1],
    allow: allowMatch?.[1] ?? '',
    allowfullscreen: hasFullscreen,
  }, 'user');
  quill.setSelection(insertIndex + 1, 'silent');
}

function onEditorReady(quill) {
  // Override the default image handler which embeds base64
  const toolbar = quill.getModule('toolbar');
  if (toolbar) {
    toolbar.addHandler('image', handleImageUpload);
    toolbar.addHandler('iframe', handleIframeEmbed);
  }

  // Add iframe toolbar button icon (Quill has no built-in iframe icon)
  const iframeButton = quill.container.closest('.quillWrapper')
    ?.querySelector('.ql-iframe');
  if (iframeButton) {
    iframeButton.innerHTML = `<svg viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="3" width="16" height="12" rx="1.5" stroke="currentColor" stroke-width="1.5" fill="none"/>
      <path d="M6 7l-3 2 3 2M12 7l3 2-3 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    </svg>`;
  }
}
</script>

<template>
  <div :class="['editor-wrapper', { 'editor-error': error }]">
    <vue-editor
      ref="editorRef"
      v-model="inputValue"
      :placeholder="t('additional:modules.dataNarrator.label.htmlContent')"
      :editor-toolbar="constants.htmlEditorToolbar"
      @ready="onEditorReady"
    />
  </div>
</template>

<style lang="scss">
.editor-wrapper {
  .quillWrapper {
    display: flex;
    flex-direction: column-reverse;

    .ql-container {
      border: 1px solid #ccc !important;
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
      border-bottom: 0 !important;
    }

    .ql-container .ql-editor {
      min-height: 80px;
    }

    .ql-tooltip {
      // override computed left style from thirdparty lib
      left: 15px !important;
    }

    .ql-toolbar {
      border-top: 0;
      border-bottom-left-radius: 4px;
      border-bottom-right-radius: 4px;
    }
  }
}

.editor-error {
  .ql-container {
    border-color: #d32f2f !important;
  }

  .ql-toolbar {
    border-color: #d32f2f !important;
  }
}

// Iframe embeds inside the editor
.ql-editor {
  iframe {
    display: block;
    width: 100%;
    max-width: 600px;
    aspect-ratio: 16 / 9;
    border: none;
    margin: 4px 0;
  }
}

// Iframe toolbar button icon
.ql-iframe svg {
  width: 18px;
  height: 18px;
  stroke: currentColor;
  fill: none;
}
</style>
