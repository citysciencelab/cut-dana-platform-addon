<script>
import DataNarratorWindowMixins from "../../../mixins/DataNarratorWindowMixins";
import ToolWindow from "../../shared/Toolwindow/ToolWindow.vue";
import LoginMixin from "../../../mixins/LoginMixin";
import NavigationMixins from "../../../mixins/NavigationMixins";
import StepForm from "./StepForm.vue";

export default {
    name: "CreateStep",
    components: {
        StepForm, Toolwindow: ToolWindow
    },
    mixins: [DataNarratorWindowMixins, LoginMixin, NavigationMixins]
};
</script>

<template>
    <Toolwindow>
        <template #header>

        </template>
        <template #default>
            <div id="tool-dataNarrator-creator-stepForm">
                <StepForm />
            </div>
        </template>
        <template #footer>
            <div class="actions-container" />
        </template>
    </Toolwindow>
</template>

<style scoped lang="scss">
.actions-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: .2rem;
}
</style>
