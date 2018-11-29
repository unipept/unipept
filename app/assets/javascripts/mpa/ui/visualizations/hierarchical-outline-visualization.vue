<template>
    <div>
        <!-- We cannot use the pre-built simple-button here because we need to attach a specific id to the input-field to allow the non-Vue searchTree to work -->
        <div class="input-group" id="tree_search_group">
            <input type="search" name="tree_search" id="tree_search" v-model="searchTerm" placeholder="search for an organism..." class="form-control">
            <span class="input-group-addon">
                <span class="glyphicon glyphicon-search"></span>
            </span>
        </div>
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
        components: {ValidatedTextfield, SimpleButton},
        computed: {
            searchTerm: {
                get() {
                    let term = this.$store.getters.selectedTerm;
                    if (term === 'Organism') {
                        return '';
                    }
                    return term;
                },
                set(val) {
                    // should do nothing!
                }
            }
        }
    })
    export default class HierarchicalOutlineVisualization extends Vue {
        @Prop({default: null}) dataset: NewPeptideContainer | null;

        searchTree!: any;

        mounted() {
            this.initSearchTree();
        }

        @Watch('dataset') onDatasetChanged() {
            this.initSearchTree();
        }

        @Watch('activeSearchTerm') onActiveSearchTermChanged(newSearchTerm: string, oldSearchTerm: string) {
            console.log(newSearchTerm);
            if (this.searchTree && newSearchTerm !== "") {
                console.log(newSearchTerm);
                setTimeout(() => {
                    this.searchTree.search(newSearchTerm);
                }, 500);
            }
        }

        private initSearchTree() {
            if (this.dataset != null && this.dataset.getDataset() != null) {
                let tree: Tree = this.dataset.getDataset().getTree();
                this.searchTree = constructSearchtree(tree, this.$store.getters.searchSettings.isEquateIl(), () => {});
            }
        }

        get activeSearchTerm() {
            return this.$store.getters.selectedTerm;
        }
    }
</script>

<style scoped>

</style>
