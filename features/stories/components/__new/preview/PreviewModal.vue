<script setup>
import { ref, watch } from "vue";
import { motion } from "motion-v";
import {mdiCheck, mdiRestore} from "@mdi/js";

const props = defineProps({
    open: { type: Boolean, default: false }
});
const emit = defineEmits(["update:open", "close"]);

const state = ref(props.open ? "open" : "closed");
watch(() => props.open, (v) => (state.value = v ? "open" : "closed"));

function close() {
    emit("update:open", false);
    emit("close");
}

const overlay = {
    closed: { opacity: 0, pointerEvents: "none", transition: { duration: 0.2 } },
    open:   { opacity: 1, pointerEvents: "auto", transition: { duration: 0.2 } }
};

const panel = {
    closed: { opacity: 0, y: 20, scale: 0.98, transition: { duration: 0.18 } },
    open:   { opacity: 1, y: 0,  scale: 1,   transition: { type: "spring", stiffness: 420, damping: 32 } }
};
</script>

<template>
    <motion.div
        class="preview-modal__overlay"
        :initial="'closed'"
        :animate="state"
        :variants="overlay"
    >
        <motion.div
            class="preview-modal__panel"
            :initial="'closed'"
            :animate="state"
            :variants="panel"
            role="dialog"
            aria-modal="true"
        >
            <div class="preview-modal__content">
                <div class="preview-modal__content__top mb-3">
                    <slot />
                </div>

                <v-row class="justify-center preview-modal__content__footer">
                    <v-btn
                        type="button"
                        :icon="mdiRestore"
                        class="mr-1"
                        density="comfortable"
                        variant="flat"
                        color="#d1e2ff"
                        @click="close"
                    />
                    <v-btn
                        type="button"
                        :prepend-icon="mdiCheck"
                        rounded
                        variant="flat"
                        color="#d1e2ff"
                        @click="close"
                    >
                        Fertig
                    </v-btn>
                </v-row>
            </div>
        </motion.div>
    </motion.div>
</template>

<style scoped lang="scss">
.preview-modal__overlay {
    position: absolute;
    inset: 0;
    z-index: 2000;
    display: grid;
    place-items: center;
    padding: 56px 12px 12px 12px;
}
.preview-modal__panel {
    width: 100%;
    height: 100%;
    background: #fff;
    border-radius: 16px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}
.preview-modal__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    border-bottom: 1px solid #eee;
}
.preview-modal__close {
    border: 0;
    background: transparent;
    font-size: 18px;
    cursor: pointer;
}
.preview-modal__content {
    padding: 16px;
    overflow: auto;
    position: relative;
    height: 100%;
    display: flex;
    flex-direction: column;
}
.preview-modal__content__top {
    height: 100%;
    overflow-y: auto;
    border-bottom: 1px solid #e1e1e1;
}
.preview-modal__content__footer {
    margin-top: auto;
}
</style>
