import NetworkUtils from "@/logic/communicators/NetworkUtils";

export enum ProteomeType {
    Reference,
    Other,
    Redundant,
    Excluded
}

interface Proteome {
    id: string
    type: ProteomeType
    organism: string,
    count: number
}

export default class UniprotCommunicator {
    private static UNIPROT_API_URL = "https://rest.uniprot.org/uniprotkb/search";
    private static PROTEOMES_STREAM_URL = "https://rest.uniprot.org/proteomes/stream";

    public static async getRecordCount(taxa: number[]): Promise<number> {
        let idQuery: string;
        if (taxa.length === 0) {
            idQuery = "*";
        } else {
            idQuery = taxa.map(taxon => `taxonomy_id:${taxon}`).join("+OR+");
        }

        const result = await NetworkUtils.getJSON(
            `${UniprotCommunicator.UNIPROT_API_URL}?facets=reviewed&query=${idQuery}&size=0`
        );

        return result["facets"][0]["values"]
            .reduce((acc: number, item: any) => acc + item["count"], 0)
    }

    public static async getProteome(proteome: string): Promise<Proteome | undefined> {
        try {
            const res = await NetworkUtils.getJSON(
                `${UniprotCommunicator.PROTEOMES_STREAM_URL}?format=json&query=upid:${proteome}`
            );

            const p = res.results[0];
            return {
                id: p.id,
                type: UniprotCommunicator.castProteomeType(p.proteomeType),
                organism: p.taxonomy.scientificName + (p.taxonomy.commonName ? " (" + p.taxonomy.commonName + ")" : ""),
                count: p.proteinCount
            };
        } catch (e) {
            return undefined;
        }
    }

    private static castProteomeType(type: string): ProteomeType {
        switch (type) {
            case "Reference and representative proteome": return ProteomeType.Reference;
            case "Other proteome": return ProteomeType.Other;
            case "Redundant proteome": return ProteomeType.Redundant;
            case "Excluded": return ProteomeType.Excluded;
        }
        throw new Error(`Provided proteome type ${type} does not exist.`)
    }
}
