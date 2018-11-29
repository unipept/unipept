<template>
    <div>
        <div class="btn-group mpa-fa-advanced">
            <a class="btn btn-xs btn-default dropdown-toggle" data-toggle="dropdown" aria-expanded="false">
                <span class="glyphicon glyphicon-cog"></span>
            </a>
            <div class="dropdown-menu dropdown-menu-right card-supporting-text">
                <div class="form-group">
                    <label for="mpa-fa-filter-precent">Filtering</label>
                    <span class="small glyphicon glyphicon-question-sign help btn-icon" @click="functionalModalActive = true"></span>
                    <div class="input-group">
                        <span class="input-group-addon">≥</span>
                        <input type="number" class="form-control" min="0" max="100" autocomplete="off" step="5" v-model="model" id="mpa-fa-filter-precent" style="min-width: 60px;">
                        <span class="input-group-addon">% of annotated proteins</span>
                    </div>
                    <a v-if="model !== '5'" class="pull-right" @click="model = '5'">reset to 5%</a>
                </div>
            </div>
        </div>
        <modal :active="functionalModalActive" :wide="true">
            <template slot="header">
                <button type="button" class="close" data-dismiss="modal" aria-hidden="true" @click="functionalModalActive = false">×</button>
                <h4 class="modal-title">Functional Annotation filtering</h4>
            </template>
            <template slot="body">
                    <h4 id="quick-explanation">Quick explanation</h4>
                    <p>By default Unipept does not report all found annotations. It uses a clever filtering technique that removes untrustworthy annotations. The strength of This filter is expressed as a percentage.</p>
                    <ul>
                        <li><strong>0%</strong> means no filtering occurs. <br>
                            We assign the annotation <var>A</var>. to a peptide sequence <var>P</var> if there is at least one protein that contains an exact match for <var>P</var> and has been assigned the annotation <var>A</var>.
                        </li>
                        <li><strong>100%</strong> is the strongest level of filtering. <br> In this case we require that every protein that contains a certain peptide sequence <var>P</var> has the annotation <var>A</var>. before we assign the annotation <var>A</var>. to the peptide.</li>
                    </ul>
                    <p>
                        The default value is 5%. This means that a peptide sequence <var>P</var> is assumed to be annotated with an annotation <var>A<var> if at least 5% of the UniProt entries<a href="#fn1" class="footnote-ref" id="fnref1"><sup>1</sup></a> in which <var>P</var> occurs has been annotated with <var>A<var>.
                    </var></var></var></var></p>
                    <h4 id="in-more-depth">In more depth</h4>
                    <p>
                        When you supply a list of peptides to Unipept, it needs to find out what functional annotations correspond to each of those peptides. To do this we look at the UniProt proteins that in which each of your peptides occurs.
                    </p>
                    <section class="card">
                        <div class="row">
                            <div class="col-xs-5">
                                <p class="card-supporting-text">
                                    <strong>1. Fetch protein information</strong><br>
                                    UniProt proteins are annotated with GO Terms and EC numbers. We want to project these on tryptic peptides.
                                </p>
                            </div>
                            <div class="col-xs-7">
                                <img class="img-responsive" src="/images/mpa/proteoms.svg" alt="Proteoms">
                            </div>
                        </div>
                    </section>

                    <section class="card">
                        <div class="row">
                            <div class="col-xs-5">
                                <p class="card-supporting-text">
                                    <strong>2. Digest and copy annotations</strong><br>
                                    We perform an in-scilo trypsin digest of the proteins. The annotations of the proteins are copied to the products of the digests.
                                </p>
                            </div>
                            <div class="col-xs-7">
                                <img class="img-responsive" src="/images/mpa/matches.svg" alt="Matches">
                            </div>
                        </div>
                    </section>

                    <section class="card">
                        <div class="row">
                            <div class="col-xs-5">
                                <p class="card-supporting-text">
                                    <strong>3. Summarise annotations per tryptic</strong><br>
                                    We can now see the annotations that various proteins assigned to a supplied tryptic peptide.
                                    In the next step we will count these.
                                </p>
                            </div>
                            <div class="col-xs-7">
                                <img class="img-responsive" src="/images/mpa/annotations.svg" alt="Annotations">
                            </div>
                        </div>
                    </section>

                    <section class="card">
                        <p class="card-supporting-text">
                            <strong>4. Summarise annotations per tryptic and store in database</strong><br>
                            In unipept we do the above experiment for each tryptic peptide in the UniProtKB during a precomputaion step. The number of occurrences of each annotation is stored in a database. When one of the sequences is used in an analysis we look up the results and only take annotations that occur in more than 5% of the matched Uniprot entries into account.
                        </p>
                        <img class="img-responsive" src="/images/mpa/summary.svg" alt="Summary">
                    </section>
                    <hr>
                    <ol>
                        <li id="fn1"><p>Only UniProt entries with at least one annotation are taken into account.<a href="#fnref1" class="footnote-back">↩</a></p></li>
                    </ol>
            </template>
        </modal>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";
    import Modal from "../../components/modal/modal.vue";

    @Component({
        components: {Modal},
        computed: {
            model: {
                get() {
                    return this.content;
                },
                set(val) {
                    this.content = val;
                    this.$emit('input', val);
                }
            }
        }
    })
    export default class FilterFunctionalAnnotationsDropdown extends Vue {
        @Prop({default: "5"}) value: string;

        content: string = this.value;
        functionalModalActive: boolean = false;

        @Watch('value') onValueChanged(newValue: string, oldValue: string) {
            this.content = newValue;
        }
    }
</script>

<style scoped>

</style>
