<template>
    <div>
        <v-row
            v-for="parameter in parameters"
            :key="parameter.name"
        >
            <v-col
                class="d-flex justify-sm-end pb-0 pt-sm-0"
                cols="12"
                sm="3"
            >
                <b>{{ parameter.name }}</b>
            </v-col>
            <v-col
                class="pt-0 pb-0"
                cols="12"
                sm="9"
            >
                {{ parameter.description }}
            </v-col>
        </v-row>
    </div>
</template>

<script setup lang="ts">
export type Parameter = {
    name: string,
    description: string
};

export interface Props {
    parameters: Parameter[]
}

defineProps<Props>();
</script>
