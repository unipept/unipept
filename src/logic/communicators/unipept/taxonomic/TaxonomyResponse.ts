import {NcbiId, NcbiRank} from "@/logic/ontology/taxonomic/Ncbi";

export default interface TaxonomyResponse {
    taxon_id: NcbiId,
    taxon_name: string,
    taxon_rank: NcbiRank,
    descendants: NcbiId[]
}
