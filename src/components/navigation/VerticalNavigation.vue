<template>
    <v-tabs vertical slider-size="3" color="secondary">
        <div v-for="item in items" :key="item.name">
            <v-tab :to="item.link" exact-path>
                {{ item.name }}
            </v-tab>
            <div class="sub-tabs" v-if="matchRoute(item.link, $route.path)">
                <v-tab v-for="child in item.children" class="v-tab-child" :key="child.name" :to="child.link">
                    {{ child.name }}
                </v-tab>
            </div>
        </div>
    </v-tabs>
</template>

<script setup lang="ts">
import { NavigationItem } from './NavigationItem';

export interface Props {
    items: NavigationItem[]
}

/* eslint-disable */
defineProps<Props>();

const matchRoute = (link: string, route: string) => {
    if(link.split("/").length == 2) {
        return route == link;
    }

    return route.startsWith(link);
}
</script>

<style scoped>
.v-tab {
    justify-content: start;
    text-align: start;
    padding-left: 5%;
    text-transform: none;
    max-height: 35px;
}

.v-tabs /deep/ .v-slide-group__wrapper {
    overflow: visible !important;
}

.v-tab-child {
    padding-left: 15%;
    font-size: 75% !important;
    max-height: 25px;
}

@keyframes tabs-grow {
    from {
        max-height: 0px;
    }
  
    to {
        max-height: 200px;
    }
}

.sub-tabs {
    overflow: hidden;
    animation-name: tabs-grow;
    animation-duration: 1s;
}
</style>
