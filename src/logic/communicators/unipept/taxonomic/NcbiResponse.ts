import {NcbiId, NcbiRank} from "@/logic/new/ontology/taxonomic/Ncbi";

export default interface NcbiResponse {
    id: NcbiId,
    name: string,
    rank: NcbiRank,
    lineage: NcbiId[]
}
