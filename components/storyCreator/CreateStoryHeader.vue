<script>
import NavigationMixins from "../../mixins/NavigationMixins";
import {dataNarratorModes} from "../../store/contantsDataNarrator";

export default {
    name: "CreateStoryHeader",
    mixins: [NavigationMixins],
    computed: {
        dataNarratorModes() {
            return dataNarratorModes
        }
    }
};
</script>

<template lang="html">
    <div class="createStory-header">
        <button @click="() => gotoPage(dataNarratorModes.DASHBOARD)" class="button">Home</button>
    </div>
</template>

<style scoped lang="scss">
.createStory-header {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 1rem;
    padding: .5rem 0;

    .button {
        border: 1px solid gray;
        border-radius: 9999rem;
        padding: 0.2rem .8rem;
    }
}
</style>
