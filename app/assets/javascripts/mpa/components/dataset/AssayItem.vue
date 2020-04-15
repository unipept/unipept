<template>
    <v-list-item ripple @click="activateAssay(assay)" :class="$store.getters.getActiveAssay === assay ? 'selected-list-item' : ''">
        <v-list-item-action>
            <div class="select-dataset-radio" v-if="progress === 1">
                <v-radio-group v-model="activeAssayModel">
                    <v-radio :value="assay"></v-radio>
                </v-radio-group>
            </div>
            <v-progress-circular v-else :rotate="-90" :size="24" :value="progress * 100" color="primary"></v-progress-circular>
        </v-list-item-action>
        <v-list-item-content>
            <v-list-item-title>
                {{ assay.getName() }}
            </v-list-item-title>
            <v-list-item-subtitle>
                {{ assay.getAmountOfPeptides() }} peptides
            </v-list-item-subtitle>
        </v-list-item-content>

        <v-list-item-action>
            <v-list-item-action-text>
                {{ assay.getDate().toLocaleDateString() }}
            </v-list-item-action-text>
            <tooltip message="Remove assay from analysis.">
                <v-icon @click="deselectAssay(assay)" v-on:click.stop>mdi-delete-outline</v-icon>
            </tooltip>
        </v-list-item-action>
    </v-list-item>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import ProteomicsAssay from "unipept-web-components/src/business/entities/assay/ProteomicsAssay";
import Tooltip from "unipept-web-components/src/components/custom/Tooltip.vue";

@Component({
    components: {
        Tooltip
    },
    computed: {
        activeAssayModel: {
            get(): ProteomicsAssay {
                return this.$store.getters.getActiveAssay;
            },
            set(assay: ProteomicsAssay) {
                // Nothing to do here!
            }
        },
        progress: {
            get() {
                return this.$store.getters.getProgressStatesMap.find(p => p.assay.getId() === this.assay.getId()).progress;
            }
        }
    }
})
export default class AssayItem extends Vue {
    @Prop({ required: true })
    private assay: ProteomicsAssay;

    private activateAssay(assay: ProteomicsAssay): void {
        this.$store.dispatch("setActiveAssay", assay);
    }

    private deselectAssay(assay: ProteomicsAssay): void {
        this.$store.dispatch("removeAssay", assay);
    }
}
</script>

<style>
    .selected-list-item .v-list__item:before {
        content: ' ';
        background-color: #2196F3;
        width: 4px;
        height: 100%;
        position: relative;
        left: -12px;
    }

    .selected-list-item .v-list__item {
        margin-left: -4px;
    }
</style>
