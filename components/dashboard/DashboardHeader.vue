<script>
import LoginMixin from "../../mixins/LoginMixin";

export default {
    name: "DashboardHeader",
    mixins: [LoginMixin],
};
</script>

<template lang="html">
    <div class="dashboard-header">
        <div>{{ email }}</div>
        <button v-if="loggedIn" @click="logoutButton" class="button">Logout</button>
        <button v-if="!loggedIn" @click="openLoginWindow" class="button">Login</button>
    </div>
</template>

<style scoped lang="scss">
.dashboard-header {
    display: flex;
    justify-content: flex-end;
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
