<template>
    <div>
        <card-header>
            <ul class="nav nav-tabs">
                <li v-for="tab in tabs" v-if="tab.constructor.name === 'Tab'" v-bind:class="{ active: tab.activated }" @click="changeActiveTab(tab)">
                    <a>{{ tab.label }}</a>
                </li>
            </ul>
        </card-header>
        <card-body>
            <div class="tab-content">
                <slot></slot>
            </div>
        </card-body>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";
    import CardHeader from "./card-header.vue";
    import CardBody from "./card-body.vue";
    import Tab from "./tab.vue";

    @Component({
        components: {CardBody, CardHeader}
    })
    export default class Tabs extends Vue {
        tabs: Tab[] = [];

        mounted() {
            this.tabs = this.$children[1].$children as Tab[];
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
