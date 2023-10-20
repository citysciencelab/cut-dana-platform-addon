<script>
export default {
    name: "TOCMenu",
    props: {
        currentStepIndex: {
            type: Number,
            default: 0
        }
    },
    methods: {
        backToStep () {
            this.$emit("setCurrentStepIndex", this.currentStepIndex);
        }
    }
};
</script>

<template>
    <div id="TOC-menu">
        <span
            role="button"
            tabindex="0"
            @click="backToStep()"
            @keydown="backToStep()"
        >
            <v-tooltip left>
                <template #activator="{ on, attrs }">
                    <v-icon
                        v-bind="attrs"
                        v-on="on"
                    >keyboard_backspace</v-icon>
                </template>
                <span>{{ $t("additional:modules.tools.dataNarrator.button.backToStory") }}</span>
            </v-tooltip>
        </span>
    </div>
</template>

<style lang="scss" scoped>
#TOC-menu {
    position: absolute;
    width: 100%;
    text-align: end;

    .v-icon {
        font-size: 1.3rem;
        cursor: pointer;
    }
}

</style>
