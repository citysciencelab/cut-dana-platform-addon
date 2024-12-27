<script>


export default {
    name: "LoginButton",
    components: {},
    computed: {
        ...mapGetters("Tools/DataNarrator", Object.keys(getters))
    },
    methods: {
        ...mapMutations("Tools/DataNarrator", Object.keys(mutations))
    }
};
</script>

<template lang="html">
    <div>hi</div>
</template>
