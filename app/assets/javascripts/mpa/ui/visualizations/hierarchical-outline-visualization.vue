<template>
    <div>
        <validated-textfield placeholder="search for an organism..." id="tree_search_group">
            <template slot="addonButton">
                <simple-button glyphicon="search"></simple-button>
            </template>
        </validated-textfield>
        <div id="searchtree" class="treeView multi"></div>
        <div id="tree_data">
            <p>
                Click on a node in the tree to see the peptides associated with that organism.
                Double-click to focus on it.
            </p>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";
    import NewPeptideContainer from "../../NewPeptideContainer";
    import {Tree} from "../../tree";
    import {constructSearchtree} from "../../searchtree";
    import SimpleButton from "../../../components/button/simple-button.vue";
    import ValidatedTextfield from "../../../components/input/validated-textfield.vue";

    @Component({
        components: {ValidatedTextfield, SimpleButton}
    })
    export default class HierarchicalOutlineVisualization extends Vue {
        @Prop({default: null}) dataset: NewPeptideContainer | null;

        mounted() {
            this.initSearchTree();
        }

        @Watch('dataset') onDatasetChanged() {
            this.initSearchTree();
        }

        private initSearchTree() {
            if (this.dataset != null && this.dataset.getDataset() != null) {
                let tree: Tree = this.dataset.getDataset().getTree();
                const data = JSON.stringify(tree.getRoot());

                constructSearchtree(tree, this.$store.getters.searchSettings.isEquateIl(), () => {});
            }
        }
    }
</script>

<style scoped>

</style>
