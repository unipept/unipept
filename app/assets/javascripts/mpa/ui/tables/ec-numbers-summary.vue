<template>
    <div>
        <div id="ecTable"></div>
        <div id="ecTreeView">
            <div id="ec-btns">
                <button id='save-btn-ec' disabled=disabled class='btn btn-default btn-xs btn-animate'>
                    <span class='glyphicon glyphicon-download down'></span> Save tree as image
                </button>
                <button id='reset-btn-ec' disabled=disabled class='btn btn-default btn-xs btn-animate' title="Reset view">
                    <span class="glyphicon glyphicon-repeat spin"></span>
                </button>
            </div>
            <output>
            </output>
        </div>
        <modal :active="chartImageModalActive">

        </modal>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";
    import {FunctionalAnnotations} from "../../../fa/FunctionalAnnotations";
    import ECNumbers from "../../../fa/ecnumbers";
    import {downloadDataByForm, logToGoogle, numberToPercent, toCSVString, triggerDownloadModal} from "../../../utils";
    import {AmountTable} from "../../../components/amount_table";
    import FaSortSettings from "./FaSortSettings";
    import NewPeptideContainer from "../../NewPeptideContainer";
    import Modal from "../../../components/modal/modal.vue";
    @Component({
        components: {Modal}
    })
    export default class EcNumbersSummary extends Vue {
        @Prop() fa: FunctionalAnnotations | null;
        @Prop({default: null}) peptideContainer: NewPeptideContainer | null;
        @Prop() sortSettings: FaSortSettings;

        chartImageModalActive: boolean = false;

        mounted() {
            this.initECTable();
        }

        @Watch('fa') onFaChanged(newFa: FunctionalAnnotations, oldFa: FunctionalAnnotations) {
            this.initECTable(oldFa);
        }

        private initECTable(oldFa: FunctionalAnnotations = null): void {
            if (!this.fa) {
                return;
            }

            const faEC: ECNumbers = this.fa.getGroup("EC") as ECNumbers;
            this.setUpECTree(faEC);
            this.setUpECTable(this.fa, oldFa);
        }

        private setUpECTree(ecResultSet: ECNumbers): void {
            const $container = $("#ecTreeView output");
            $("#save-btn-ec").unbind("click");
            $container.empty();
            if (ecResultSet.getTrust().annotatedCount > 0) {
                const tree = $container.treeview(ecResultSet.treeSequencesData(), {
                    width: 916,
                    height: 500,
                    enableAutoExpand: true,
                    getTooltip: d => {
                        const fullcode = (d.name + ".-.-.-.-").split(".").splice(0, 4).join(".");
                        let tip = this.tooltipEC(fullcode);
                        tip += `<div class="tooltip-fa-text">
                        <strong>${d.data.count} peptides</strong> have at least one EC number within ${fullcode},<br>`;

                        if (d.data.self_count == 0) {
                            tip += "no specific annotations";
                        } else {
                            if (d.data.self_count == d.data.count) {
                                tip += " <strong>all specifically</strong> for this number";
                            } else {
                                tip += ` <strong>${d.data.self_count} specificly</strong> for this number`;
                            }
                        }

                        tip += "</div>";
                        return tip;
                    },
                });


                // save tree button
                $("#save-btn-ec").prop("disabled", false)
                    .click(() => {
                        logToGoogle("Multi peptide", "Save EC Image");
                        triggerDownloadModal($container.find("svg"), null, "unipept_treeview");
                    });
                $("#reset-btn-ec").prop("disabled", false)
                    .click(() => {
                        tree.reset();
                    });
            } else {
                $("#save-btn-ec").prop("disabled", true);
            }
        }

        /**
         * Create the EC amount table
         *
         * @param {FunctionalAnnotations} fa Functional annotations
         * @param {FunctionalAnnotations} [oldFa=null]
         *     Snapshot of functional annotations for comparision
         */
        private setUpECTable(fa, oldFa = null) {
            const sortOrder = this.sortSettings;

            const ecResultSet = fa.getGroup("EC");
            const oldEcResultSet = oldFa === null ? null : oldFa.getGroup("EC");

            let data = ecResultSet.getSorted(sortOrder.sortFunc);

            const target = d3.select("#ecTable");
            target.html("");
            // TODO fix type annotations in future!
            // noinspection TypeScriptValidateTypes
            new AmountTable({
                title: "EC numbers",
                el: target,
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
                        title: "EC number",
                        html: d => {
                            const spans = d.code.split(".").map(e => `<span>${e}</span>`).join(".");
                            return `<a href="https://enzyme.expasy.org/EC/${d.code}" class="ec-number-formatted" target="_blank">${spans}</a>`;
                        },
                        text: d => d.code,
                        style: {"width": "8em"},
                    },
                    {
                        title: "Name",
                        text: d => ECNumbers.fullNameOf(d.code),
                    },
                    {
                        builder: cell => {
                            this.addFADownloadBtn(cell, d => "EC:" + d.code);
                        },
                        text: d => "",
                        style: {"width": "5em", "text-align": "right"},
                        exported: false,
                    },
                ],
                more: (d, container) => this.faMoreinfo(d, "EC:" + d.code, container, 840),
                tooltip: d => this.tooltipEC(d.code, ecResultSet, oldEcResultSet),
                tooltipID: "#tooltip",
            }).draw();
        }

        /**
         * Generate a tooltip for an EC number
         * @param  {string}    ecNumber   The EC number to generate a tooltip for
         * @param  {FunctionalAnnotations} [ecResultSet=null]  A `ECNumbers` summary
         * @param  {FunctionalAnnotations} [oldEcResultSet=null]  A `ECNumbers` summary snapshot
         * @return {string}    HTML for the tooltip
         */
        private tooltipEC(ecNumber, ecResultSet = null, oldEcResultSet = null) {
            const fmt = x => `<div class="tooltip-ec-ancestor"><span class="tooltip-ec-term">EC ${x}</span><span class="tooltip-ec-name">${ECNumbers.nameOf(x)}</span></div>`;
            const fmth = x => `<div class="tooltip-ec-ancestor tooltip-ec-current"><span class="tooltip-ec-term">EC ${x}</span><h4 class="tooltip-fa-title">${ECNumbers.nameOf(x)}</h4></div>`;

            let result = "";

            if (ECNumbers.ancestorsOf(ecNumber).length > 0) {
                result += `${ECNumbers.ancestorsOf(ecNumber).reverse().map(c => fmt(c)).join("\n")}`;
            }
            result += fmth(ecNumber);

            result += this.tootipResultSet(ecNumber, ecResultSet, oldEcResultSet);
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

        private addFADownloadBtn(cell, codeFn) {
            const downloadLink = cell.append("span");
            downloadLink.classed("glyphicon glyphicon-download glyphicon-inline down btn-icon", true)
                .attr("title", "Download CSV of the matched peptides")
                .attr("role", "button")
                .attr("tabindex", 0)
                .on("click", d => {
                    d3.event.stopPropagation();
                    this.downloadPeptidesFor(codeFn(d), Object.keys(d.sequences));
                });

            // HACK: d3 to jQuery
            $(downloadLink[0]).tooltip();
        }

        private async downloadPeptidesFor(name, sequences) {
            let container = this.peptideContainer;

            if (container && container.getDataset()) {
                let dataset = container.getDataset();

                const result = [[
                    "peptide",
                    "spectral count",
                    "matching proteins",
                    "matching proteins with " + name,
                    "percenage proteins with " + name,
                ]]
                    .concat((await dataset.getPeptidesByFA(name, sequences))
                        .map(x => [
                            x.sequence,
                            x.count,
                            x.allCount,
                            x.hits,
                            100 * x.hits / x.allCount,
                        ]));
                downloadDataByForm(toCSVString(result), name + ".csv", "text/csv");
            }
        }

    }
</script>

<style scoped>

</style>
