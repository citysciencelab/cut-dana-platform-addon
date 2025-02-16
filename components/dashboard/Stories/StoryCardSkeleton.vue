<script>


export default {
    name: "StoryCardSkeleton",
    components: {

    },
    props: {
        uid: {
            type: String,
            default: null
        },
        isAdmin: {
            type: Boolean,
            default: false
        },
        grid: {
            type: Boolean,
            default: true
        }
    }
};
</script>

<template>
    <v-skeleton-loader
        elevation="1"
        :class="{'grid-item': grid, 'mb-5': true}"
        type="card-avatar, actions"
    />
</template>

<style lang="scss" scoped>

.topper {
    z-index: 1000;
}
.grid-item {
    width: 100%;

    flex: 0 0 100%;
    max-width: 100%;
    margin-bottom: 2px;


    @media (min-width: 768px){
        flex: 0 0 calc(50% - 20px);
        max-width: calc(50% - 20px)
    }

    @media(min-width: 992px) {
        flex: 0 0 calc(33.3333333333% - 20px);
        max-width: calc(33.3333333333% - 20px);
    }

    @media(min-width: 1800px) {
        flex: 0 0 calc(25% - 20px);
        max-width: calc(25% - 20px);
    }

}
</style>
