import OntologyCode from "unipept-web-components/dist/types/logic/ontology/OntologyCode";
import CountTable from "@/logic/new/CountTable";

export default class FunctionalCountTable<O extends OntologyCode> extends CountTable<O> {
    constructor(counts: Map<O, number>, totalCount?: number) {
        super(counts, totalCount);
    }


}
