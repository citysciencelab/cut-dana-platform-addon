<script setup>
import { mdiWeb } from '@mdi/js';
import { useTranslation } from 'i18next-vue';
import { ref, onMounted, onBeforeUnmount } from 'vue';

const { i18next } = useTranslation();
const currentLanguage = ref(i18next.language);

function handleLangChanged(lng) {
  currentLanguage.value = lng
}
onMounted(() => {
  i18next.on('languageChanged', handleLangChanged);
})

onBeforeUnmount(() => {
  i18next.off('languageChanged', handleLangChanged);
})

const languages = [ 'en', 'de' ]
function changeToNextLanguage() {
  const idx = languages.indexOf(i18next.language)
  const next = languages[(idx + 1) % languages.length]
  i18next.changeLanguage(next)
}
</script>

<template>
  <v-btn
    rounded
    size="small"
    elevation="0"
    @click="changeToNextLanguage()"
  >
    <v-icon small>
      {{ mdiWeb }}
    </v-icon>
    {{ currentLanguage }}
  </v-btn>
</template>
