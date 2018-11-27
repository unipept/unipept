<template>
    <div></div>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";
    import {logToGoogle, numberToPercent, stringTitleize, triggerDownloadModal} from "../../../utils";
    import {AmountTable} from "../../../components/amount_table";
    import GOTerms from "../../../fa/goterms";
    import {FunctionalAnnotations} from "../../../fa/FunctionalAnnotations";
    import NewPeptideContainer from "../../NewPeptideContainer";
    import {Dataset} from "../../dataset";

    @Component
    export default class GoTermsSummary extends Vue {
        @Prop() namespace: string;
        @Prop({default: null}) peptideContainer: NewPeptideContainer | null;

        @Watch('dataset') onDatasetChanged() {
            this.initGoTable();
        }

        mounted() {
            this.initGoTable();
        }

        initGoTable(): void {
            const goPanel = d3.select(this.$el);
            goPanel.html("");

            if (this.peptideContainer && this.peptideContainer.getDataset()) {
                let dataset: Dataset = this.peptideContainer.getDataset();

                let fa = dataset.fa;
                const go = fa.getGroup("GO");
                // TODO what does oldFa do here?
                //const goOld = oldFa === null ? null : oldFa.getGroup("GO");
                //const oldNsFagroup = goOld === null ? null : goOld.getGroup(this.faNamespace);
                const oldNsFagroup = null;

                const nsFagroup = go.getGroup(this.namespace);
                const article = goPanel.append("div").attr("class", "row");
                article.append("h3").text(stringTitleize(this.namespace));
                this.setUpGoTable(nsFagroup, article, oldNsFagroup);
                // this.setUpQuickGo(nsFagroup, article);
            }
        }

        private setUpGoTable(goResultset, target, oldGoResultset = null) {
            const sortOrder = this.$store.getters.displaySettings.isOnlyStarredFa();
            const tablepart: D3.selection = target.append("div").attr("class", "col-xs-8");
            let data = goResultset.getSorted(sortOrder.sortFunc);
            // TODO fix type annotations in future!
            // noinspection TypeScriptValidateTypes
            new AmountTable({
                title: `GO terms - ${goResultset.getName()}`,
                el: tablepart,
                data: data,
                limit: 5,
                contents: [
                    {
                        title: sortOrder.name,
                        text: d => d[sortOrder.field].toString(),
                        html: d => sortOrder.format(d),
                        style: {"width": "5em"},
                        shade: d => 100 * d[sortOrder.shadeField],
                    },
                    {
                        title: "GO term",
                        html: d => `<a href="https://www.ebi.ac.uk/QuickGO/term/${d.code}" target="_blank">${d.code}</a>`,
                        text: d => d.code,
                        style: {"width": "7em"},
                    },
                    {
                        title: "Name",
                        text: d => GOTerms.nameOf(d.code),
                    },
                    {
                        builder: cell => {
                            // TODO Fix download!
                            //this.addFADownloadBtn(cell, d => d.code);
                        },
                        text: d => "",
                        style: {"width": "6em", "text-align": "right"},
                        exported: false,
                    },
                ],
                more: (d, container) => this.faMoreinfo(d, d.code, container, 535),
                tooltip: (d: any) => this.tooltipGO(d.code, goResultset, oldGoResultset),
                tooltipID: "#tooltip",
            }).draw();
        }

        /**
         * Generate a tooltip for an GO term
         * @param  {string}    goTerm   The Ec term to generate a tooltip for
         * @param  {FunctionalAnnotations} [faResultSet=null]  A `GOTerms` summary
         * @param  {FunctionalAnnotations} [oldFaResultSet=null]  A `GOTerms` summary snapshot
         * @return {string}    HTML for the tooltip
         */
        private tooltipGO(goTerm: string, faResultSet: FunctionalAnnotations | null = null, oldFaResultSet: FunctionalAnnotations | null = null) {
            let result = `
            <h4 class="tooltip-fa-title">
                <span class="tooltip-fa-title-name">${GOTerms.nameOf(goTerm)}</span>
            </h4>
            <span class="tooltip-go-domain">${stringTitleize(GOTerms.namespaceOf(goTerm))}</span> — <span class="tooltip-go-title-term"> ${goTerm}</span>`;

            result += this.tootipResultSet(goTerm, faResultSet, oldFaResultSet);
            return result;
        }

        /**
         *
         * @param {*} thing
         * @param {FunctionalAnnotations} cur A FunctionalAnnotations that contains the term
         * @param {FunctionalAnnotations} [old=null] A FunctionalAnnotations that contains the term
         * @return {string} HTML content for tooltip
         */
        private tootipResultSet(thing, cur, old = null) {
            const curdata = key => cur.valueOf(thing, key);
            let result = "";
            if (cur !== null) {
                result += "<div class=\"tooltip-fa-text\">";
                result += `Assigned to <strong>${numberToPercent(curdata("fractionOfPepts"), 2)}</strong> of peptides (<strong>${curdata("numberOfPepts")}</strong>)`;
                if (old != null) {
                    result += "<div class=\"tooltip-extra\">";
                    const newValue = curdata("fractionOfPepts");
                    const oldValue = old.valueOf(thing, "fractionOfPepts");
                    const diff = (newValue - oldValue) / (newValue + oldValue);
                    if (Math.abs(diff) > 0.001) {
                        result += `<span class='glyphicon glyphicon-inline glyphicon-arrow-${diff > 0 ? "up" : "down"}'></span> `;
                    }
                    result += `was ${numberToPercent(oldValue, 2)} for entire dataset`;
                    result += "</div>";
                }
                result += "</div>";
            }
            return result;
        }

        /**
         * Generate the extra information when clicked on a row in FA tables
         * @param {*} d
         * @param {string} code
         * @param {*} container
         * @param {number} width
         */
        private faMoreinfo(d, code, container, width): void {
            if (!this.peptideContainer || !this.peptideContainer.getDataset()) {
                return;
            }

            const dataset = this.peptideContainer.getDataset();
            const $container = $(container);

            const $dlbtn = $(`
                <button class='btn btn-default btn-xs btn-animate pull-right'>
                    <span class='glyphicon glyphicon-download down'></span>
                    Save as image
                </button>`
            );

            $container.append($dlbtn);

            const highlightColor = "#ffc107";
            const highlightColorFunc = d => (d.included ? highlightColor : "lightgrey");
            dataset.getFATree(code).then(faTree => $container.treeview(faTree, {
                width: width,
                height: 310,
                getTooltip: this.tooltipContent,
                colors: highlightColor,
                linkStrokeColor: ({target: d}) => highlightColorFunc(d),
                nodeStrokeColor: highlightColorFunc,
                nodeFillColor: highlightColorFunc,
                enableAutoExpand: 0.3,
            }));

            $dlbtn.click(() => {
                logToGoogle("Multi peptide", "Save Image for FA");
                triggerDownloadModal($container.find("svg"), null, "unipept_treeview_" + code);
            });
        }

        private tooltipContent(d) {
            return "<b>" + d.name + "</b> (" + d.rank + ")<br/>" +
                (!d.data.self_count ? "0" : d.data.self_count) +
                (d.data.self_count && d.data.self_count === 1 ? " sequence" : " sequences") + " specific to this level<br/>" +
                (!d.data.count ? "0" : d.data.count) +
                (d.data.count && d.data.count === 1 ? " sequence" : " sequences") + " specific to this level or lower";
        }
    }
</script>

<style scoped>

</style>
