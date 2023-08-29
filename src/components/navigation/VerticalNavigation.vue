<template>
    <v-tabs
        direction="vertical"
        color="secondary"
    >
        <div
            v-for="item in items"
            :key="item.name"
        >
            <v-tab
                :to="item.link"
                exact
            >
                {{ item.name }}
            </v-tab>
            <div
                v-if="matchRoute(item.link, $route.path)"
                class="sub-tabs"
            >
                <v-tab
                    v-for="child in item.children"
                    :key="child.name"
                    class="v-tab-child"
                    @click="navigate(child.link)"
                >
                    {{ child.name }}
                </v-tab>
            </div>
        </div>
    </v-tabs>
</template>

<script setup lang="ts">
import { NavigationItem } from './NavigationItem';
import useNavigation from "@/composables/useNavigation";

const { navigate } = useNavigation();

export interface Props {
    items: NavigationItem[]
}

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
