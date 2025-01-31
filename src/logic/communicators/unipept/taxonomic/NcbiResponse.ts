import {NcbiId, NcbiRank} from "@/logic/ontology/taxonomic/Ncbi";

export default interface NcbiResponse {
    id: NcbiId,
    name: string,
    rank: NcbiRank,
    lineage: NcbiId[]
}
