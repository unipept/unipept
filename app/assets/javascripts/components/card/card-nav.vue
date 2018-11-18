<template>
    <div class="card card-nav">
        <div class="card-title card-title-colored">
            <ul class="nav nav-tabs">
                <li v-for="tab in tabs" v-bind:class="{ active: tab.activated }" @click="changeActiveTab(tab)">
                    <a>{{ tab.label }}</a>
                </li>
            </ul>
        </div>
        <div class="card-supporting-text">
            <div class="tab-content">
                <slot></slot>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";

    import Tab from "./tab";

    @Component
    export default class CardNav extends Vue {
        tabs: Tab[] = [];

        created() {
            this.tabs = this.$children as Tab[];
        }

        changeActiveTab(tab: Tab) {
            for (let currentTab of this.tabs) {
                currentTab.activated = false;
            }

            tab.activated = true;
        }
    }
</script>

<style scoped>
</style>
